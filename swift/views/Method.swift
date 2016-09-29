// {{ method.description }}
{% if method.responseName == '' %}
open func {{ method.method }}() {

}
{% elif method.responseName == '@Binary' %}
open func {{ method.method }}() -> NSData {
    return NSData()
}
{% else %}
open func {{ method.method }}() -> {{ method.responseName }} {
   return {{ method.responseName }}(JSONString: "")!
}
{% endif %}
