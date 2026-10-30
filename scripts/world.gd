extends Node3D
class_name BlockWorld

# Terreno deterministico dividido em chunks. A mesma coordenada e seed geram o mesmo bloco.
const CHUNK_SIZE := 16
const VIEW_RADIUS := 2
const MIN_Y := -4
const MAX_Y := 32
const COLORS := [Color("78b851"), Color("986644"), Color("898b92"), Color("bca66b"), Color("97704b"), Color("56a4db"), Color("3e9650"), Color("e6c68f")]
const NAMES := ["Grama", "Terra", "Pedra", "Areia", "Madeira", "Cristal", "Folhas", "Tijolo"]
const DIRECTIONS: Array[Vector3i] = [Vector3i.UP, Vector3i.DOWN, Vector3i.LEFT, Vector3i.RIGHT, Vector3i.FORWARD, Vector3i.BACK]
var blocks: Dictionary = {} # Apenas chunks carregados
var edits: Dictionary = {} # Mudancas persistentes, inclusive blocos removidos (-1)
var chunks: Dictionary = {}
var pending: Array[Vector2i] = []
var noise := FastNoiseLite.new()
var seed_value := 20261030
var focus_chunk := Vector2i(999999, 999999)
var block_count := 0
var mesh_material: StandardMaterial3D

func _ready() -> void:
    noise.seed = seed_value
    noise.frequency = 0.034
    noise.fractal_octaves = 3
    noise.fractal_type = FastNoiseLite.FRACTAL_FBM
    mesh_material = StandardMaterial3D.new()
    mesh_material.vertex_color_use_as_albedo = true
    mesh_material.roughness = 1.0

func height_at(x: int, z: int) -> int:
    return clampi(int(round(4.0 + noise.get_noise_2d(float(x), float(z)) * 9.0)), 1, 16)

func _chunk_of(x: int, z: int) -> Vector2i:
    return Vector2i(floori(float(x) / float(CHUNK_SIZE)), floori(float(z) / float(CHUNK_SIZE)))

func generate_world() -> void:
    clear_loaded()
    focus_chunk = Vector2i(999999, 999999)
    update_stream(Vector3.ZERO)
    # Gera primeiro a area onde o jogador nasce antes da fisica comecar.
    for i in range(9):
        if pending.is_empty():
            break
        _build_chunk(pending.pop_front())

func clear_loaded() -> void:
    for node in chunks.values():
        node.queue_free()
    chunks.clear()
    blocks.clear()
    pending.clear()
    block_count = 0

func update_stream(player_position: Vector3) -> void:
    var current := _chunk_of(floori(player_position.x), floori(player_position.z))
    if current == focus_chunk:
        return
    focus_chunk = current
    var needed: Dictionary = {}
    for x in range(current.x - VIEW_RADIUS, current.x + VIEW_RADIUS + 1):
        for z in range(current.y - VIEW_RADIUS, current.y + VIEW_RADIUS + 1):
            needed[Vector2i(x, z)] = true
    for key in chunks.keys():
        if not needed.has(key):
            _unload_chunk(key)
    pending.clear()
    var ordered: Array[Vector2i] = []
    for key in needed.keys():
        if not chunks.has(key):
            ordered.append(key)
    ordered.sort_custom(func(a: Vector2i, b: Vector2i) -> bool: return (a - current).length_squared() < (b - current).length_squared())
    pending = ordered

func _process(_delta: float) -> void:
    if not pending.is_empty():
        _build_chunk(pending.pop_front()) # Uma malha por frame para evitar travadas

func _load_block(x: int, y: int, z: int, kind: int) -> void:
    var p := Vector3i(x, y, z)
    if edits.has(p):
        if int(edits[p]) >= 0:
            blocks[p] = int(edits[p])
    else:
        blocks[p] = kind

func _build_chunk(key: Vector2i) -> void:
    if chunks.has(key):
        return
    var root := Node3D.new()
    root.name = "Chunk_%s_%s" % [key.x, key.y]
    add_child(root)
    chunks[key] = root
    for x in range(key.x * CHUNK_SIZE, (key.x + 1) * CHUNK_SIZE):
        for z in range(key.y * CHUNK_SIZE, (key.y + 1) * CHUNK_SIZE):
            var h := height_at(x, z)
            for y in range(maxi(MIN_Y, h - 4), h + 1):
                _load_block(x, y, z, 2 if y < h - 3 else (1 if y < h else 0))
            if (abs(x * 17 + z * 31) % 29) == 4 and abs(x) + abs(z) > 10:
                for y in range(h + 1, h + 4):
                    _load_block(x, y, z, 4)
                for dx in range(-1, 2):
                    for dz in range(-1, 2):
                        for dy in range(3, 5):
                            var px := x + dx
                            var pz := z + dz
                            if _chunk_of(px, pz) == key:
                                _load_block(px, h + dy, pz, 6)
    # Reaplicar construcoes acima do terreno ou dentro das cavidades.
    for p in edits:
        if _chunk_of(p.x, p.z) == key:
            if int(edits[p]) == -1:
                blocks.erase(p)
            else:
                blocks[p] = int(edits[p])
    _remesh(key)
    block_count = blocks.size()

func _unload_chunk(key: Vector2i) -> void:
    var root: Node3D = chunks[key]
    chunks.erase(key)
    root.queue_free()
    for p in blocks.keys():
        if _chunk_of(p.x, p.z) == key:
            blocks.erase(p)
    block_count = blocks.size()

func _append_face(v: PackedVector3Array, n: PackedVector3Array, c: PackedColorArray, p: Vector3i, d: Vector3i, t: int) -> void:
    var normal := Vector3(d)
    var axis := Vector3.FORWARD if d.y != 0 else Vector3.UP
    var right := axis.cross(normal).normalized()
    var up := normal.cross(right).normalized()
    var center := Vector3(p) + Vector3.ONE * 0.5
    var a := center - right * 0.5 - up * 0.5 + normal * 0.5
    var b := center + right * 0.5 - up * 0.5 + normal * 0.5
    var e := center - right * 0.5 + up * 0.5 + normal * 0.5
    var f := center + right * 0.5 + up * 0.5 + normal * 0.5
    var shade := 1.0 if d.y == 1 else (0.65 if d.y == -1 else 0.85)
    for point in [a,b,e,b,f,e]:
        v.append(point)
        n.append(normal)
        c.append(COLORS[t] * shade)

func _remesh(key: Vector2i) -> void:
    if not chunks.has(key):
        return
    var root: Node3D = chunks[key]
    for child in root.get_children():
        root.remove_child(child)
        child.queue_free()
    var vertices := PackedVector3Array()
    var normals := PackedVector3Array()
    var colors := PackedColorArray()
    for p in blocks:
        if _chunk_of(p.x, p.z) != key:
            continue
        for d in DIRECTIONS:
            if not blocks.has(p + d):
                _append_face(vertices, normals, colors, p, d, int(blocks[p]))
    if vertices.is_empty():
        return
    var arrays: Array = []
    arrays.resize(Mesh.ARRAY_MAX)
    arrays[Mesh.ARRAY_VERTEX] = vertices
    arrays[Mesh.ARRAY_NORMAL] = normals
    arrays[Mesh.ARRAY_COLOR] = colors
    var mesh := ArrayMesh.new()
    mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
    mesh.surface_set_material(0, mesh_material)
    var visual := MeshInstance3D.new()
    visual.mesh = mesh
    root.add_child(visual)
    var body := StaticBody3D.new()
    var shape := CollisionShape3D.new()
    shape.shape = mesh.create_trimesh_shape()
    body.add_child(shape)
    root.add_child(body)

func change_block(p: Vector3i, t: int) -> bool:
    if p.y < MIN_Y or p.y > MAX_Y or not chunks.has(_chunk_of(p.x, p.z)):
        return false
    if t < 0:
        if not blocks.has(p):
            return false
        blocks.erase(p)
        edits[p] = -1
    else:
        if blocks.has(p) or t >= COLORS.size():
            return false
        blocks[p] = t
        edits[p] = t
    var key := _chunk_of(p.x, p.z)
    _remesh(key)
    for neighbor in [Vector2i(1,0),Vector2i(-1,0),Vector2i(0,1),Vector2i(0,-1)]:
        if chunks.has(key + neighbor):
            _remesh(key + neighbor)
    block_count = blocks.size()
    return true

func snapshot() -> Array:
    var result: Array = []
    for p in edits:
        result.append([p.x, p.y, p.z, int(edits[p])])
    return result

func restore(entries: Array) -> void:
    edits.clear()
    for entry in entries:
        if entry is Array and entry.size() == 4:
            edits[Vector3i(int(entry[0]), int(entry[1]), int(entry[2]))] = int(entry[3])
    generate_world()
