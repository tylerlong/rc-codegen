
public class {{ definition.name }}: Mappable {
  {% for field in definition.fields %}
  {% include "Field.swift" %}
  {% endfor %}
}
