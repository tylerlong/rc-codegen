import Foundation
import ObjectMapper

{% for definition in definitions %}
  {% include "Definition.swift" %}
{% endfor %}
