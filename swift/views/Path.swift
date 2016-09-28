import Foundation
import ObjectMapper

open class {{ className }}: Model {
    public override var pathSegment: String {
        get{
            return "{{ segment }}"
        }
    }

    {% for method in methods %}
        {% include "Method.swift" %}

        {% for definition in method.definitions %}
            {% include "Definition.swift" %}
        {% endfor %}
    {% endfor %}
}
