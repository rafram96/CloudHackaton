import json

"""
Parser de JSON para generación de diagramas.
Funciones:
- load: parsea texto JSON a objeto Python.
- validate: valida que el objeto sea dict o list.
- to_ir: convierte objeto a IR (nodos y aristas).
"""

def load(code: str):
    try:
        return json.loads(code)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON inválido: {str(e)}")


def validate(obj):
    if not isinstance(obj, (dict, list)):
        raise ValueError("Se espera un objeto JSON (dict o list)")
    # Añadir validaciones extra si es necesario
    return True


def to_ir(obj, graph_type='flowchart'):
    if graph_type == 'classDiagram':
        return generate_class_diagram(obj)
    elif graph_type == 'sequenceDiagram':
        return generate_sequence_diagram(obj)
    elif graph_type == 'stateDiagram':
        return generate_state_diagram(obj)
    elif graph_type == 'erDiagram':
        return generate_er_diagram(obj)
    
    # Por defecto, generar flowchart
    return generate_flowchart(obj)

def generate_class_diagram(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un classDiagram.
    """
    classes = obj.get('classes', [])
    lines = ['classDiagram']

    for cls in classes:
        class_name = cls['name']
        lines.append(f'class {class_name} {{')

        for attr in cls.get('attributes', []):
            lines.append(f'    {attr}')

        for method in cls.get('methods', []):
            lines.append(f'    {method}')

        lines.append('}')

    for cls in classes:
        if 'extends' in cls:
            lines.append(f'{cls["extends"]} <|-- {cls["name"]}')

    return '\n'.join(lines)

def generate_sequence_diagram(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un sequenceDiagram.
    """
    participants = obj.get('participants', [])
    messages = obj.get('messages', [])
    lines = ['sequenceDiagram']

    for participant in participants:
        lines.append(f'participant {participant}')

    for message in messages:
        lines.append(f'{message["from"]} ->> {message["to"]}: {message["text"]}')

    return '\n'.join(lines)

def generate_state_diagram(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un stateDiagram.
    """
    states = obj.get('states', [])
    transitions = obj.get('transitions', [])
    lines = ['stateDiagram-v2']

    for state in states:
        lines.append(f'state {state}')

    for transition in transitions:
        lines.append(f'{transition["from"]} --> {transition["to"]}: {transition["text"]}')

    return '\n'.join(lines)

def generate_er_diagram(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un erDiagram.
    """
    entities = obj.get('entities', [])
    relationships = obj.get('relationships', [])
    lines = ['erDiagram']

    for entity in entities:
        lines.append(f'{entity["name"]} {{')
        for attr in entity.get('attributes', []):
            lines.append(f'    {attr}')
        lines.append('}')

    for relationship in relationships:
        lines.append(f'{relationship["from"]} {relationship["type"]} {relationship["to"]}')

    return '\n'.join(lines)

def generate_flowchart(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un flowchart.
    """
    nodes = obj.get('nodes', [])
    edges = obj.get('edges', [])
    lines = ['graph TD']

    for node in nodes:
        lines.append(f'{node["id"]}[{node["label"]}]')

    for edge in edges:
        if 'label' in edge:
            lines.append(f'{edge["from"]} -->|{edge["label"]}| {edge["to"]}')
        else:
            lines.append(f'{edge["from"]} --> {edge["to"]}')

    return '\n'.join(lines)
