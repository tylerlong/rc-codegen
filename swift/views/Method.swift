// {{ method.description }}
{% if method.responseName == '' %}
func {{ method.method }}() {

}
{% elif method.responseName == '@Binary' %}
func {{ method.method }}() -> NSData {
    return NSData()
}
{% else %}
func {{ method.method }}() -> {{ method.responseName }} {
   return {{ method.responseName }}(JSONString: "")!
}
{% endif %}
