import Foundation
import ObjectMapper

{% for definition in definitions %}
  public class {{ definition.name }}: Mappable {

    {% for field in definition.fields %}
      // {{ field.description }}
      var `{{ field.name }}`: {{ field.type }}?
    {% endfor %}

    required public init?(_ map: Map) {

    }

    public func mapping(map: Map) {
      {% for field in definition.fields %}
        `{{ field.name }}` <- map["{{ field.name }}"]
      {% endfor %}
    }

  }
{% endfor %}
