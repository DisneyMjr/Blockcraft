extends Node3D
class_name BlockWorld

const SIZE := 40
const MIN_Y := -3
const MAX_Y := 23
const COLORS := [Color("78b851"), Color("986644"), Color("898b92"), Color("bca66b"), Color("97704b"), Color("56a4db"), Color("3e9650"), Color("e6c68f")]
const NAMES := ["Grama", "Terra", "Pedra", "Areia", "Madeira", "Cristal", "Folhas", "Tijolo"]
var blocks: Dictionary = {}
var surface_instance: MeshInstance3D
var static_body: StaticBody3D
var collision_shape: CollisionShape3D
var noise := FastNoiseLite.new()
var seed_value := 20261030
var block_count := 0

func _ready() -> void:
	noise.seed = seed_value
	noise.frequency = 0.045
	noise.fractal_octaves = 3
	noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	surface_instance = MeshInstance3D.new()
	add_child(surface_instance)
	static_body = StaticBody3D.new()
	add_child(static_body)
	collision_shape = CollisionShape3D.new()
	static_body.add_child(collision_shape)

func height_at(x: int, z: int) -> int:
	return clampi(int(round(4.0 + noise.get_noise_2d(float(x), float(z)) * 7.0)), 1, 12)

func generate_world() -> void:
	blocks.clear()
	for x in range(-SIZE / 2, SIZE / 2):
		for z in range(-SIZE / 2, SIZE / 2):
			var h := height_at(x, z)
			for y in range(MIN_Y, h + 1):
				var t := 2 if y < h - 3 else (1 if y < h else 0)
				blocks[Vector3i(x, y, z)] = t
	for x in range(-SIZE / 2 + 4, SIZE / 2 - 4, 5):
		for z in range(-SIZE / 2 + 4, SIZE / 2 - 4, 6):
			if abs(x) < 5 and abs(z) < 5:
				continue
			if abs(noise.get_noise_2d(float(x * 3), float(z * 3))) < 0.19:
				var h := height_at(x, z)
				for y in range(h + 1, h + 5):
					blocks[Vector3i(x, y, z)] = 4
				for dx in range(-2, 3):
					for dz in range(-2, 3):
						for dy in range(3, 6):
							if abs(dx) + abs(dz) + abs(dy - 4) < 5:
								var p := Vector3i(x + dx, h + dy, z + dz)
								if not blocks.has(p):
									blocks[p] = 6
	rebuild()

func _append_face(vertices: PackedVector3Array, normals: PackedVector3Array, colors: PackedColorArray, p: Vector3i, normal: Vector3i, t: int) -> void:
	var n := Vector3(normal)
	var u := Vector3.UP
	if normal.y != 0:
		u = Vector3.FORWARD
	var right := u.cross(n).normalized()
	var up := n.cross(right).normalized()
	var c := Vector3(p) + Vector3.ONE * 0.5
	var a := c - right * 0.5 - up * 0.5 + n * 0.5
	var b := c + right * 0.5 - up * 0.5 + n * 0.5
	var d := c - right * 0.5 + up * 0.5 + n * 0.5
	var e := c + right * 0.5 + up * 0.5 + n * 0.5
	var shade := 1.0 if normal.y == 1 else (0.65 if normal.y == -1 else (0.86 if normal.x != 0 else 0.76))
	var tint := COLORS[t] * shade
	for v in [a, b, d, b, e, d]:
		vertices.append(v)
		normals.append(n)
		colors.append(tint)

func rebuild() -> void:
	var vertices := PackedVector3Array()
	var normals := PackedVector3Array()
	var colors := PackedColorArray()
	var directions: Array[Vector3i] = [Vector3i.UP, Vector3i.DOWN, Vector3i.LEFT, Vector3i.RIGHT, Vector3i.FORWARD, Vector3i.BACK]
	for p in blocks:
		for d in directions:
			if not blocks.has(p + d):
				_append_face(vertices, normals, colors, p, d, int(blocks[p]))
	if vertices.size() == 0:
		return
	var arrays := []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_COLOR] = colors
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays)
	var material := StandardMaterial3D.new()
	material.vertex_color_use_as_albedo = true
	material.roughness = 1.0
	material.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	mesh.surface_set_material(0, material)
	surface_instance.mesh = mesh
	collision_shape.shape = mesh.create_trimesh_shape()
	block_count = blocks.size()

func change_block(p: Vector3i, t: int) -> bool:
	if p.x < -SIZE / 2 or p.x >= SIZE / 2 or p.z < -SIZE / 2 or p.z >= SIZE / 2:
		return false
	if p.y < MIN_Y or p.y > MAX_Y:
		return false
	if t < 0:
		if not blocks.has(p):
			return false
		blocks.erase(p)
	else:
		if blocks.has(p):
			return false
		blocks[p] = t
	rebuild()
	return true

func snapshot() -> Array:
	var entries: Array = []
	for p in blocks:
		entries.append([p.x, p.y, p.z, int(blocks[p])])
	return entries

func restore(entries: Array) -> void:
	blocks.clear()
	for e in entries:
		if e is Array and e.size() == 4:
			blocks[Vector3i(int(e[0]), int(e[1]), int(e[2]))] = clampi(int(e[3]), 0, COLORS.size()-1)
	rebuild()
