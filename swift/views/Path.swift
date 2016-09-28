open class {{ className }}: Model {
    public override var pathSegment: String {
        get{
            return "{{ segment }}"
        }
    }

    {% for method in methods %}
        // {{ method.description }}
        func {{ method.method }}() {

        }
    {% endfor %}
}
