{% if child.hasId %}
open func `{{ child.camelCase }}`(_ _id: String? = nil) -> {{ child.PascalCase }} {
  return {{ child.PascalCase }}(parent: self, _id: _id)
}
{% else %}
open func `{{ child.camelCase }}`() -> {{ child.PascalCase }} {
  return {{ child.PascalCase }}(parent: self)
}
{% endif %}
