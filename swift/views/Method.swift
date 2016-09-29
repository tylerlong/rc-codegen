// {{ method.description }}
{% if method.responseName == '' %}
open func {{ method.method }}(callback: @escaping (_ error: HTTPError?) -> Void) {
    rc.{{method.method}}String(self.endpoint()) { string, error in
      callback(error)
    }
}
{% elif method.responseName == '@Binary' %}
open func {{ method.method }}() -> NSData {
    return NSData()
}
{% else %}
open func {{ method.method }}(callback: @escaping (_ t: {{ method.responseName }}?, _ error: HTTPError?) -> Void) {
   rc.{{method.method}}(self.endpoint()) { (t: {{ method.responseName }}?, error) in
      callback(t, error)
   }
}
{% endif %}
