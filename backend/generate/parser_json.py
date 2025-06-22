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


def to_ir(obj):
    nodes = []
    edges = []
    
    def recurse(o, parent_id=None):
        if isinstance(o, dict):
            for key, val in o.items():
                node_id = f"{parent_id}_{key}" if parent_id else key
                nodes.append({'id': node_id, 'label': key})
                if parent_id:
                    edges.append({'from': parent_id, 'to': node_id})
                recurse(val, node_id)
        elif isinstance(o, list):
            for idx, item in enumerate(o):
                node_id = f"{parent_id}_{idx}"
                nodes.append({'id': node_id, 'label': str(idx)})
                edges.append({'from': parent_id, 'to': node_id})
                recurse(item, node_id)
        else:
            leaf_id = f"{parent_id}_val"
            nodes.append({'id': leaf_id, 'label': str(o)})
            edges.append({'from': parent_id, 'to': leaf_id})

    recurse(obj)
    return {'nodes': nodes, 'edges': edges}
