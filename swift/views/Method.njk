// {{ method.description }}
{% if method.responseName == '' %}
open func {{ method.method }}(callback: @escaping (_ error: HTTPError?) -> Void) {
    rc.{{ method.method | http_method }}String(self.endpoint()) { string, error in
      callback(error)
    }
}
{% else %}
open func {{ method.method }}(callback: @escaping (_ t: {{ method.responseName }}?, _ error: HTTPError?) -> Void) {
   rc.{{ method.method | http_method }}(self.endpoint()) { (t: {{ method.responseName }}?, error) in
      callback(t, error)
   }
}
{% endif %}
