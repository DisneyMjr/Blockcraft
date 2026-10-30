extends Node3D

const WorldScript = preload("res://scripts/world.gd")
const SAVE_PATH := "user://blockcraft_save.json"
const PLAYER_SPEED := 6.0
const PLAYER_JUMP := 7.0
const BLOCK_COLORS := [Color("78b851"), Color("986644"), Color("898b92"), Color("bca66b"), Color("97704b"), Color("56a4db"), Color("3e9650"), Color("e6c68f")]

var world: BlockWorld
var player: CharacterBody3D
var camera: Camera3D
var companion: Node3D
var ui: CanvasLayer
var menu: Control
var hud: Control
var name_label: Label
var info_label: Label
var selected_character := "Ângelo"
var survival := false
var selected_block := 0
var inventory := [64, 64, 64, 64, 64, 64, 64, 64]
var hearts := 10
var started := false
var joy := Vector2.ZERO
var look_touch := -1
var move_touch := -1
var move_origin := Vector2.ZERO
var last_look := Vector2.ZERO
var clock := 0.0
var sun: DirectionalLight3D

func _ready() -> void:
	_setup_environment()
	_setup_player()
	_setup_ui()
	_show_menu()

func _setup_environment() -> void:
	var env := WorldEnvironment.new()
	var resource := Environment.new()
	resource.background_mode = Environment.BG_COLOR
	resource.background_color = Color("80c9f4")
	resource.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	resource.ambient_light_color = Color("b8dbf3")
	resource.ambient_light_energy = 0.7
	env.environment = resource
	add_child(env)
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -32, 0)
	sun.light_energy = 1.3
	add_child(sun)
	world = WorldScript.new()
	add_child(world)

func _setup_player() -> void:
	player = CharacterBody3D.new()
	player.name = "Jogador"
	add_child(player)
	var shape := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.32
	capsule.height = 1.65
	shape.shape = capsule
	shape.position.y = 0.85
	player.add_child(shape)
	camera = Camera3D.new()
	camera.current = true
	camera.position.y = 1.55
	camera.fov = 75
	player.add_child(camera)

func _panel(parent: Node, text: String, rect: Rect2, callback: Callable, color: Color = Color("254f72")) -> Button:
	var b := Button.new()
	b.text = text
	b.position = rect.position
	b.size = rect.size
	b.add_theme_color_override("font_color", Color.WHITE)
	b.add_theme_font_size_override("font_size", 21)
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = 12
	style.corner_radius_top_right = 12
	style.corner_radius_bottom_left = 12
	style.corner_radius_bottom_right = 12
	style.border_width_bottom = 3
	style.border_color = Color("112f45")
	b.add_theme_stylebox_override("normal", style)
	parent.add_child(b)
	b.pressed.connect(callback)
	return b

func _label(parent: Node, text: String, pos: Vector2, font_size: int) -> Label:
	var l := Label.new()
	l.text = text
	l.position = pos
	l.add_theme_font_size_override("font_size", font_size)
	l.add_theme_color_override("font_color", Color.WHITE)
	l.add_theme_color_override("font_shadow_color", Color("153550"))
	l.add_theme_constant_override("shadow_offset_x", 2)
	l.add_theme_constant_override("shadow_offset_y", 2)
	parent.add_child(l)
	return l

func _setup_ui() -> void:
	ui = CanvasLayer.new()
	add_child(ui)
	menu = Control.new()
	menu.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(menu)
	var bg := ColorRect.new()
	bg.color = Color(0.03, 0.09, 0.14, 0.84)
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	menu.add_child(bg)
	_label(menu, "BLOCKCRAFT", Vector2(332, 50), 52)
	_label(menu, "As aventuras de Ângelo e Valentina", Vector2(317, 118), 21)
	_label(menu, "ESCOLHA SEU PERSONAGEM", Vector2(349, 182), 19)
	_panel(menu, "ÂNGELO", Rect2(276, 228, 185, 54), func(): _select_character("Ângelo"), Color("2265a5"))
	_panel(menu, "VALENTINA", Rect2(487, 228, 185, 54), func(): _select_character("Valentina"), Color("a45595"))
	name_label = _label(menu, "Selecionado: Ângelo", Vector2(365, 296), 20)
	_panel(menu, "CRIATIVO", Rect2(276, 345, 185, 58), func(): _start_game(false), Color("367847"))
	_panel(menu, "SOBREVIVÊNCIA", Rect2(487, 345, 185, 58), func(): _start_game(true), Color("9a5732"))
	_label(menu, "Construir • Explorar • Salvar mundos", Vector2(327, 442), 18)
	hud = Control.new()
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(hud)
	info_label = _label(hud, "", Vector2(16, 13), 18)
	_panel(hud, "MENU", Rect2(842, 12, 100, 46), _show_menu, Color("364d63"))
	_panel(hud, "SALVAR", Rect2(721, 12, 110, 46), _save_game)
	_panel(hud, "QUEBRAR", Rect2(800, 375, 136, 58), _break_block, Color("a44f35"))
	_panel(hud, "COLOCAR", Rect2(800, 443, 136, 58), _place_block, Color("448b55"))
	_panel(hud, "PULAR", Rect2(656, 443, 130, 58), _jump)
	_panel(hud, "◀", Rect2(28, 445, 75, 55), func(): _cycle_block(-1))
	_panel(hud, "▶", Rect2(113, 445, 75, 55), func(): _cycle_block(1))
	_label(hud, "Arraste à esquerda para andar; à direita para olhar", Vector2(16, 76), 15)
	_label(hud, "+", Vector2(469, 239), 28)
	_label(hud, "WASD • mouse • espaço no computador", Vector2(16, 101), 14)
	hud.visible = false

func _select_character(value: String) -> void:
	selected_character = value
	name_label.text = "Selecionado: " + value

func _show_menu() -> void:
	started = false
	menu.visible = true
	hud.visible = false
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func _start_game(is_survival: bool) -> void:
	survival = is_survival
	hearts = 10
	inventory = [64, 64, 64, 64, 64, 64, 64, 64] if not survival else [12, 8, 0, 0, 0, 0, 0, 0]
	world.generate_world()
	player.position = Vector3(0.5, world.height_at(0, 0) + 3.5, 0.5)
	player.velocity = Vector3.ZERO
	player.rotation = Vector3.ZERO
	camera.rotation = Vector3.ZERO
	_spawn_companion()
	_load_game()
	started = true
	menu.visible = false
	hud.visible = true

func _make_part(parent: Node3D, pos: Vector3, scale_value: Vector3, color: Color) -> void:
	var m := MeshInstance3D.new()
	m.mesh = BoxMesh.new()
	m.position = pos
	m.scale = scale_value
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	m.material_override = mat
	parent.add_child(m)

func _spawn_companion() -> void:
	if is_instance_valid(companion):
		companion.queue_free()
	companion = Node3D.new()
	add_child(companion)
	companion.position = Vector3(2.5, world.height_at(2, 1) + 1.0, 1.5)
	var is_valentina := selected_character == "Ângelo"
	var shirt := Color("efe2cd") if is_valentina else Color("202f60")
	var pants := Color("e9a2b7") if is_valentina else Color("456f9b")
	var hair := Color("362920")
	_make_part(companion, Vector3(0, 1.9, 0), Vector3(0.7, 0.72, 0.65), Color("c99a76"))
	_make_part(companion, Vector3(0, 2.31, -0.04), Vector3(0.76, 0.28, 0.76), hair)
	if is_valentina:
		_make_part(companion, Vector3(-0.37, 1.75, 0.09), Vector3(0.19, 1.16, 0.37), hair)
		_make_part(companion, Vector3(0.37, 1.75, 0.09), Vector3(0.19, 1.16, 0.37), hair)
	_make_part(companion, Vector3(0, 1.17, 0), Vector3(0.8, 0.84, 0.42), shirt)
	_make_part(companion, Vector3(-0.51, 1.12, 0), Vector3(0.24, 0.74, 0.37), Color("c99a76"))
	_make_part(companion, Vector3(0.51, 1.12, 0), Vector3(0.24, 0.74, 0.37), Color("c99a76"))
	_make_part(companion, Vector3(-0.2, 0.42, 0), Vector3(0.33, 0.8, 0.38), pants)
	_make_part(companion, Vector3(0.2, 0.42, 0), Vector3(0.33, 0.8, 0.38), pants)

func _physics_process(delta: float) -> void:
	if not started:
		return
	clock += delta
	sun.rotation.x = -0.8 + sin(clock * 0.012) * 0.65
	if not player.is_on_floor():
		player.velocity.y -= 20.0 * delta
	var v := Vector2.ZERO
	if Input.is_action_pressed("move_left"):
		v.x -= 1.0
	if Input.is_action_pressed("move_right"):
		v.x += 1.0
	if Input.is_action_pressed("move_forward"):
		v.y += 1.0
	if Input.is_action_pressed("move_back"):
		v.y -= 1.0
	v += joy
	v = v.limit_length(1.0)
	var forward := -player.global_transform.basis.z
	var right := player.global_transform.basis.x
	var movement := (right * v.x + forward * v.y).normalized()
	player.velocity.x = movement.x * PLAYER_SPEED
	player.velocity.z = movement.z * PLAYER_SPEED
	if Input.is_action_just_pressed("jump"):
		_jump()
	player.move_and_slide()
	if player.position.y < -20:
		player.position = Vector3(0, world.height_at(0, 0) + 4.0, 0)
	if survival and player.position.y < -10:
		hearts = maxi(0, hearts - 1)
	info_label.text = "%s | %s | %s (%d) | %s" % [selected_character, "Sobrevivência" if survival else "Criativo", BlockWorld.NAMES[selected_block], inventory[selected_block], "Vida: %d" % hearts if survival else "Blocos livres"]

func _jump() -> void:
	if started and player.is_on_floor():
		player.velocity.y = PLAYER_JUMP

func _cycle_block(step: int) -> void:
	selected_block = posmod(selected_block + step, BLOCK_COLORS.size())

func _ray_block(place: bool) -> Vector3i:
	var from := camera.global_position
	var to := from - camera.global_transform.basis.z * 6.0
	var query := PhysicsRayQueryParameters3D.create(from, to)
	query.exclude = [player.get_rid()]
	var result := get_world_3d().direct_space_state.intersect_ray(query)
	if result.is_empty():
		return Vector3i(1000, 1000, 1000)
	var p: Vector3 = result.position + result.normal * (0.05 if place else -0.05)
	return Vector3i(floori(p.x), floori(p.y), floori(p.z))

func _break_block() -> void:
	if not started:
		return
	var p := _ray_block(false)
	if world.blocks.has(p):
		var block_type: int = world.blocks[p]
		if world.change_block(p, -1) and survival:
			inventory[block_type] += 1

func _place_block() -> void:
	if not started:
		return
	if survival and inventory[selected_block] <= 0:
		return
	var p := _ray_block(true)
	if Vector3(p).distance_to(player.position) < 1.2:
		return
	if world.change_block(p, selected_block) and survival:
		inventory[selected_block] -= 1

func _unhandled_input(event: InputEvent) -> void:
	if not started:
		return
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		_look(event.relative * 0.0028)
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_RIGHT:
			_place_block()
		elif event.button_index == MOUSE_BUTTON_LEFT:
			if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
				_break_block()
			else:
				Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func _input(event: InputEvent) -> void:
	if not started or not OS.has_feature("mobile"):
		return
	if event is InputEventScreenTouch:
		if event.pressed:
			if event.position.x < get_viewport().get_visible_rect().size.x * 0.35 and event.position.y < 400:
				move_touch = event.index
				move_origin = event.position
			elif event.position.y < 365:
				look_touch = event.index
				last_look = event.position
		else:
			if event.index == move_touch:
				joy = Vector2.ZERO
				move_touch = -1
			if event.index == look_touch:
				look_touch = -1
	if event is InputEventScreenDrag:
		if event.index == move_touch:
			var delta_pos: Vector2 = (event.position - move_origin) / 60.0
			joy = Vector2(delta_pos.x, -delta_pos.y).limit_length(1.0)
		elif event.index == look_touch:
			_look(event.position - last_look, 0.004)
			last_look = event.position

func _look(motion: Vector2, factor: float = 1.0) -> void:
	player.rotation.y -= motion.x * factor
	camera.rotation.x = clampf(camera.rotation.x - motion.y * factor, -1.3, 1.3)

func _save_game() -> void:
	if not started:
		return
	var data := {"character": selected_character, "survival": survival, "position": [player.position.x, player.position.y, player.position.z], "blocks": world.snapshot(), "inventory": inventory, "health": hearts}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data))

func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(SAVE_PATH))
	if not (parsed is Dictionary):
		return
	if parsed.get("character", "") != selected_character or bool(parsed.get("survival", false)) != survival:
		return
	if parsed.has("blocks") and parsed["blocks"] is Array:
		world.restore(parsed["blocks"])
	if parsed.has("position") and parsed["position"].size() == 3:
		var p: Array = parsed["position"]
		player.position = Vector3(float(p[0]), float(p[1]), float(p[2]))
	if parsed.has("inventory") and parsed["inventory"].size() == 8:
		inventory = parsed["inventory"]
	hearts = int(parsed.get("health", 10))

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if started:
			_save_game()
			_show_menu()
		else:
			get_tree().quit()
