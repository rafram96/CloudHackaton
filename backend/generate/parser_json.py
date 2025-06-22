import json

"""
Parser de JSON para generación de diagramas Mermaid.
Funciones:
- parse_and_generate: entrada principal del sistema (recomendado).
- load: parsea texto JSON a objeto Python.
- validate: asegura que el objeto es dict o list.
- to_ir: convierte objeto Python a código Mermaid.
"""

def load(code: str):
    try:
        if isinstance(code, dict):
            return code
        return json.loads(code)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON inválido: {str(e)}")


def validate(obj):
    if not isinstance(obj, (dict, list)):
        raise ValueError("Se espera un objeto JSON (dict o list)")
    return True


def parse_and_generate(code: str, graph_type='flowchart'):
    """
    Punto de entrada recomendado.
    Parsea y valida JSON, y genera el diagrama Mermaid.
    """
    obj = load(code)
    validate(obj)
    return to_ir(obj, graph_type)


def to_ir(obj, graph_type='flowchart'):
    """
    Convierte un objeto Python (dict o list) a código Mermaid.
    """
    if graph_type == 'classDiagram':
        return generate_class_diagram(obj)
    elif graph_type == 'sequenceDiagram':
        return generate_sequence_diagram(obj)
    elif graph_type == 'stateDiagram':
        return generate_state_diagram(obj)
    return generate_flowchart(obj)


def generate_class_diagram(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un classDiagram.
    """
    if not isinstance(obj, dict):
        raise ValueError("Formato inválido para classDiagram: se esperaba un objeto JSON.")
    if 'classes' not in obj:
        raise ValueError("Formato inválido para classDiagram: falta el campo 'classes'.")

    classes = obj['classes']
    lines = ['classDiagram']

    for cls in classes:
        if 'name' not in cls:
            raise ValueError("Formato inválido para classDiagram: cada clase debe tener un 'name'.")
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
    if not isinstance(obj, dict):
        raise ValueError("Formato inválido para sequenceDiagram: se esperaba un objeto JSON.")
    if 'participants' not in obj:
        raise ValueError("Formato inválido para sequenceDiagram: falta el campo 'participants'.")
    if 'messages' not in obj:
        raise ValueError("Formato inválido para sequenceDiagram: falta el campo 'messages'.")

    participants = obj['participants']
    messages = obj['messages']
    lines = ['sequenceDiagram']

    for participant in participants:
        lines.append(f'participant {participant}')

    for message in messages:
        if 'from' not in message or 'to' not in message or 'text' not in message:
            raise ValueError("Formato inválido para sequenceDiagram: cada mensaje debe tener 'from', 'to' y 'text'.")
        lines.append(f'{message["from"]} ->> {message["to"]}: {message["text"]}')

    return '\n'.join(lines)


def generate_state_diagram(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un stateDiagram.
    """
    if not isinstance(obj, dict):
        raise ValueError("Formato inválido para stateDiagram: se esperaba un objeto JSON.")
    if 'states' not in obj:
        raise ValueError("Formato inválido para stateDiagram: falta el campo 'states'.")
    if 'transitions' not in obj:
        raise ValueError("Formato inválido para stateDiagram: falta el campo 'transitions'.")

    states = obj['states']
    transitions = obj['transitions']
    lines = ['stateDiagram-v2']

    # Generar estados con sintaxis correcta de Mermaid
    for state in states:
        if isinstance(state, dict):
            state_id = state.get('id', 'unknown')
            state_label = state.get('label', state_id)
            # Sintaxis: state_id : label
            lines.append(f'{state_id} : {state_label}')
        else:
            # Si el estado es solo un string, usarlo directamente
            lines.append(f'{state}')

    # Generar transiciones
    for transition in transitions:
        if 'from' not in transition or 'to' not in transition or 'text' not in transition:
            raise ValueError("Formato inválido para stateDiagram: cada transición debe tener 'from', 'to' y 'text'.")
        lines.append(f'{transition["from"]} --> {transition["to"]}: {transition["text"]}')

    return '\n'.join(lines)



def generate_flowchart(obj):
    """
    Convierte un JSON de entrada en código Mermaid para un flowchart.
    """
    if not isinstance(obj, dict):
        raise ValueError("Formato inválido para flowchart: se esperaba un objeto JSON.")
    if 'nodes' not in obj:
        raise ValueError("Formato inválido para flowchart: falta el campo 'nodes'.")
    if 'edges' not in obj:
        raise ValueError("Formato inválido para flowchart: falta el campo 'edges'.")

    nodes = obj['nodes']
    edges = obj['edges']
    lines = ['graph TD']

    for node in nodes:
        if 'id' not in node or 'label' not in node:
            raise ValueError("Formato inválido para flowchart: cada nodo debe tener 'id' y 'label'.")
        lines.append(f'{node["id"]}[{node["label"]}]')

    for edge in edges:
        if 'from' not in edge or 'to' not in edge:
            raise ValueError("Formato inválido para flowchart: cada arista debe tener 'from' y 'to'.")
        if 'label' in edge:
            lines.append(f'{edge["from"]} -->|{edge["label"]}| {edge["to"]}')
        else:
            lines.append(f'{edge["from"]} --> {edge["to"]}')

    return '\n'.join(lines)
