# Adaptador de IR a Mermaid (opcional) 

def ir_to_mermaid(ir):
    """
    Convierte IR {'nodes':[], 'edges':[]} a sintaxis Mermaid.
    """
    lines = ['graph TD']
    for node in ir.get('nodes', []):
        lines.append(f"{node['id']}[" + node['label'] + "]")
    for edge in ir.get('edges', []):
        lines.append(f"{edge['from']} --> {edge['to']}")
    return '\n'.join(lines)
