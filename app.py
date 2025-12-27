from flask import Flask, render_template, jsonify
import json
import math

app = Flask(__name__)

def generate_tree_model():
    """Generate 3D coordinates for a tree shape"""
    points = []
    
    # Trunk
    for i in range(200):
        angle = (i / 200) * 2 * math.pi * 3
        height = (i / 200) * 0.4
        radius = 0.05 * (1 - height)
        x = radius * math.cos(angle)
        z = radius * math.sin(angle)
        y = height - 0.5
        points.append({"x": x, "y": y, "z": z})
    
    # Foliage (spherical crown)
    for i in range(800):
        theta = math.acos(2 * (i / 800) - 1)
        phi = math.pi * (1 + 5**0.5) * i
        radius = 0.25 + (i % 100) / 500
        x = radius * math.sin(theta) * math.cos(phi)
        y = radius * math.sin(theta) * math.sin(phi) + 0.15
        z = radius * math.cos(theta)
        points.append({"x": x, "y": y, "z": z})
    
    return points

def generate_car_model():
    """Generate 3D coordinates for a car shape"""
    points = []
    
    # Car body (box shape)
    for x in range(-20, 21, 2):
        for y in range(-10, 11, 2):
            for z in range(-8, 9, 2):
                if abs(x) == 20 or abs(y) == 10 or abs(z) == 8:
                    points.append({
                        "x": x / 40,
                        "y": y / 40 - 0.1,
                        "z": z / 40
                    })
    
    # Roof
    for x in range(-12, 13, 2):
        for y in range(5, 16, 2):
            for z in range(-8, 9, 2):
                if abs(z) == 8 or y == 15:
                    points.append({
                        "x": x / 40,
                        "y": y / 40 - 0.1,
                        "z": z / 40
                    })
    
    # Wheels
    for wheel_x in [-0.35, 0.35]:
        for angle in range(0, 360, 10):
            rad = math.radians(angle)
            for r in [0.08, 0.1]:
                points.append({
                    "x": wheel_x,
                    "y": math.cos(rad) * r - 0.35,
                    "z": math.sin(rad) * r
                })
    
    return points[:2000]

def generate_cube_model():
    """Generate 3D coordinates for a rotating cube"""
    points = []
    size = 0.4
    
    for face in range(6):
        for i in range(50):
            for j in range(50):
                u = (i / 50) * 2 - 1
                v = (j / 50) * 2 - 1
                
                if face == 0:  # Front
                    points.append({"x": u * size, "y": v * size, "z": size})
                elif face == 1:  # Back
                    points.append({"x": u * size, "y": v * size, "z": -size})
                elif face == 2:  # Top
                    points.append({"x": u * size, "y": size, "z": v * size})
                elif face == 3:  # Bottom
                    points.append({"x": u * size, "y": -size, "z": v * size})
                elif face == 4:  # Right
                    points.append({"x": size, "y": u * size, "z": v * size})
                elif face == 5:  # Left
                    points.append({"x": -size, "y": u * size, "z": v * size})
    
    return points[:2000]

def generate_sphere_model():
    """Generate 3D coordinates for a sphere"""
    points = []
    num_points = 2000
    
    for i in range(num_points):
        theta = math.acos(2 * (i / num_points) - 1)
        phi = math.pi * (1 + 5**0.5) * i
        radius = 0.35
        
        x = radius * math.sin(theta) * math.cos(phi)
        y = radius * math.sin(theta) * math.sin(phi)
        z = radius * math.cos(theta)
        points.append({"x": x, "y": y, "z": z})
    
    return points

def generate_dna_model():
    """Generate 3D coordinates for DNA helix"""
    points = []
    
    for i in range(1000):
        t = (i / 1000) * 6 * math.pi
        radius = 0.2
        
        # First strand
        x1 = radius * math.cos(t)
        y1 = (i / 1000) * 1.2 - 0.6
        z1 = radius * math.sin(t)
        points.append({"x": x1, "y": y1, "z": z1})
        
        # Second strand (opposite phase)
        x2 = radius * math.cos(t + math.pi)
        z2 = radius * math.sin(t + math.pi)
        points.append({"x": x2, "y": y1, "z": z2})
        
        # Connecting rungs (every 20th point)
        if i % 20 == 0:
            for j in range(5):
                interp = j / 5
                x_mid = x1 * (1 - interp) + x2 * interp
                z_mid = z1 * (1 - interp) + z2 * interp
                points.append({"x": x_mid, "y": y1, "z": z_mid})
    
    return points

def generate_heart_model():
    """Generate 3D coordinates for a heart shape"""
    points = []
    
    for i in range(2000):
        t = (i / 2000) * 2 * math.pi
        for u in range(5):
            u_val = (u / 5) * 2 * math.pi
            
            x = 0.3 * (16 * math.sin(t)**3) / 16
            y = 0.3 * (13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t)) / 16
            z = 0.1 * math.sin(u_val)
            
            points.append({"x": x, "y": y - 0.1, "z": z})
    
    return points[:2000]

def generate_airplane_model():
    """Generate 3D coordinates for an airplane"""
    points = []
    
    # Fuselage
    for i in range(300):
        t = (i / 300) * 1.0 - 0.5
        radius = 0.08 * (1 - abs(t) * 1.5)
        for angle in range(0, 360, 20):
            rad = math.radians(angle)
            points.append({
                "x": t,
                "y": math.cos(rad) * radius,
                "z": math.sin(rad) * radius
            })
    
    # Wings
    for x in range(-10, 11):
        for z in range(-40, 41):
            if abs(z) > 5:
                points.append({
                    "x": x / 100,
                    "y": 0,
                    "z": z / 100
                })
    
    # Tail
    for y in range(0, 20):
        for z in range(-5, 6):
            points.append({
                "x": -0.45,
                "y": y / 100,
                "z": z / 100
            })
    
    return points[:2000]

def generate_human_model():
    """Generate 3D coordinates for a human figure"""
    points = []
    
    # Head
    for i in range(200):
        theta = math.acos(2 * (i / 200) - 1)
        phi = math.pi * (1 + 5**0.5) * i
        radius = 0.12
        x = radius * math.sin(theta) * math.cos(phi)
        y = radius * math.sin(theta) * math.sin(phi) + 0.45
        z = radius * math.cos(theta)
        points.append({"x": x, "y": y, "z": z})
    
    # Body
    for i in range(300):
        height = (i / 300) * 0.5
        angle = (i / 300) * 2 * math.pi * 3
        radius = 0.15
        x = radius * math.cos(angle) * 0.5
        z = radius * math.sin(angle) * 0.3
        y = 0.3 - height
        points.append({"x": x, "y": y, "z": z})
    
    # Arms
    for side in [-1, 1]:
        for i in range(150):
            height = (i / 150) * 0.4
            x = side * (0.15 + height * 0.3)
            y = 0.2 - height
            z = 0
            points.append({"x": x, "y": y, "z": z})
    
    # Legs
    for side in [-1, 1]:
        for i in range(200):
            height = (i / 200) * 0.5
            x = side * 0.1
            y = -0.2 - height
            z = 0
            points.append({"x": x, "y": y, "z": z})
    
    return points[:2000]

def generate_house_model():
    """Generate 3D coordinates for a house"""
    points = []
    
    # Base/Foundation
    for x in range(-20, 21, 2):
        for z in range(-20, 21, 2):
            if abs(x) == 20 or abs(z) == 20:
                points.append({
                    "x": x / 50,
                    "y": -0.4,
                    "z": z / 50
                })
    
    # Walls
    for i in range(150):
        height = (i / 150) * 0.5
        for angle in range(0, 360, 15):
            rad = math.radians(angle)
            if angle % 90 < 45 or angle % 90 > 45:  # Create walls, not solid
                radius = 0.4
                points.append({
                    "x": radius * math.cos(rad),
                    "y": -0.4 + height,
                    "z": radius * math.sin(rad)
                })
    
    # Roof (triangular)
    for i in range(300):
        t = (i / 300) * 2 * math.pi
        height_progress = (i % 100) / 100
        roof_height = 0.3 * (1 - height_progress)
        radius = 0.4 * (1 - height_progress)
        
        points.append({
            "x": radius * math.cos(t),
            "y": 0.1 + roof_height,
            "z": radius * math.sin(t)
        })
    
    # Door
    for i in range(50):
        height = (i / 50) * 0.3
        points.append({
            "x": 0.4,
            "y": -0.4 + height,
            "z": 0
        })
    
    # Windows
    for x_pos in [-0.2, 0.2]:
        for i in range(30):
            height = (i / 30) * 0.15
            for z_offset in [-0.05, 0.05]:
                points.append({
                    "x": 0.38,
                    "y": -0.1 + height,
                    "z": x_pos + z_offset
                })
    
    return points[:2000]

def generate_laptop_model():
    """Generate 3D coordinates for a laptop"""
    points = []
    
    # Keyboard/Base
    for x in range(-30, 31, 2):
        for z in range(-20, 21, 2):
            points.append({
                "x": x / 60,
                "y": -0.3,
                "z": z / 60
            })
    
    # Keys (small bumps on keyboard)
    for row in range(-3, 4):
        for col in range(-6, 7):
            for i in range(5):
                points.append({
                    "x": col * 0.08,
                    "y": -0.28,
                    "z": row * 0.08
                })
    
    # Screen (at an angle)
    for i in range(500):
        x = ((i % 50) / 50) * 1.0 - 0.5
        y_base = ((i // 50) / 10) * 0.8
        
        # Angle the screen back
        angle = math.radians(110)  # 110 degrees open
        y = -0.3 + y_base * math.cos(angle)
        z = -0.35 + y_base * math.sin(angle)
        
        points.append({
            "x": x,
            "y": y,
            "z": z
        })
    
    # Screen frame
    for i in range(100):
        t = (i / 100) * 2 * math.pi
        angle = math.radians(110)
        
        x = math.cos(t) * 0.52
        y_offset = abs(math.sin(t)) * 0.42
        y = -0.3 + y_offset * math.cos(angle)
        z = -0.35 + y_offset * math.sin(angle)
        
        points.append({
            "x": x,
            "y": y,
            "z": z
        })
    
    # Touchpad
    for x in range(-8, 9, 2):
        for z in range(5, 15, 2):
            points.append({
                "x": x / 60,
                "y": -0.28,
                "z": z / 60
            })
    
    return points[:2000]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models')
def get_models():
    models = {
        "tree": generate_tree_model(),
        "car": generate_car_model(),
        "cube": generate_cube_model(),
        "sphere": generate_sphere_model(),
        "dna": generate_dna_model(),
        "heart": generate_heart_model(),
        "airplane": generate_airplane_model(),
        "human": generate_human_model(),
        "house": generate_house_model(),
        "laptop": generate_laptop_model()
    }
    return jsonify(models)

@app.route('/api/save-design', methods=['POST'])
def save_design():
    """Save custom particle formation"""
    from flask import request
    import os
    
    data = request.get_json()
    design_name = data.get('name', 'custom_design')
    points = data.get('points', [])
    
    # Create designs directory if it doesn't exist
    if not os.path.exists('designs'):
        os.makedirs('designs')
    
    # Save to file
    filename = f'designs/{design_name}.json'
    with open(filename, 'w') as f:
        json.dump(points, f)
    
    return jsonify({'status': 'success', 'filename': filename})

@app.route('/api/load-design/<design_name>')
def load_design(design_name):
    """Load custom particle formation"""
    import os
    
    filename = f'designs/{design_name}.json'
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            points = json.load(f)
        return jsonify(points)
    else:
        return jsonify({'error': 'Design not found'}), 404

@app.route('/api/list-designs')
def list_designs():
    """List all saved custom designs"""
    import os
    
    if not os.path.exists('designs'):
        return jsonify([])
    
    designs = [f.replace('.json', '') for f in os.listdir('designs') if f.endswith('.json')]
    return jsonify(designs)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)