import Foundation
import ObjectMapper

{% for definition in definitions %}
  public class {{ definition.name }}: Mappable {

    {% for field in definition.fields %}
      // {{ field.description }}
      var `{{ field.name }}`: {{ field.type }}?
    {% endfor %}

  }
{% endfor %}
