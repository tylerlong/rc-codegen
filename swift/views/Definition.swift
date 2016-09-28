open class {{ definition.name }}: Mappable {

  {% for field in definition.fields %}
    // {{ field.description }}
    open var `{{ field.name }}`: {{ field.type }}?
  {% endfor %}

  required public init?(map: Map) {

  }

  open func mapping(map: Map) {
    {% for field in definition.fields %}
      `{{ field.name }}` <- map["{{ field.name }}"]
    {% endfor %}
  }

}
