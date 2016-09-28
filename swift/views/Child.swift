{% if child.hasId %}
func `{{ child.camelCase }}`(_id: String? = nil) -> {{ child.PascalCase }} {
  return {{ child.PascalCase }}(parent: self, _id: _id)
}
{% else %}
func `{{ child.camelCase }}`() -> {{ child.PascalCase }} {
  return {{ child.PascalCase }}(parent: self)
}
{% endif %}
