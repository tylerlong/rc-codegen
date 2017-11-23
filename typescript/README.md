# TS CodeGen

Turn [RC swagger spec](https://github.com/zengfenfei/rc-codegen/blob/master/common/swagger.json) into TS code.

## Differences from other languages

1. Enum types generated

## Definitions

Turn all definitions into ts interfaces(https://github.com/zengfenfei/ringcentral-js-client/tree/master/src/generated). All properties are optional.

Swagger snippet of `AccountInfo`:
```json
{
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Internal identifier of an account"
        },
        "operator": {
          "$ref": "#/definitions/ExtensionInfo",
          "description": "Operator's extension information. This extension will receive all calls and messages intended for the operator"
        },
        "setupWizardState": {
          "type": "string",
          "description": "Specifies account configuration wizard state (web service setup). The default value is 'NotStarted'",
          "enum": [
            "NotStarted",
            "Incomplete",
            "Completed"
          ]
        }
    }
}
```

Generated ts code snippet:
```typescript
// Generated Source
import { ExtensionInfo } from "./ExtensionInfo";
import { AccountServiceInfo } from "./AccountServiceInfo";
import { StatusInfo } from "./StatusInfo";

export interface AccountInfo {

    /**
     * Internal identifier of an account
     */
    id?: string;

    /**
     * Operator's extension information. This extension will receive all calls and messages intended for the operator
     */
    operator?: ExtensionInfo;

    /**
     * Specifies account configuration wizard state (web service setup). The default value is 'NotStarted'
     */
    setupWizardState?: "NotStarted" | "Incomplete" | "Completed";
}
```

## UrlSegments
Turn each segment of api endpoints into a TS class(https://github.com/zengfenfei/ringcentral-js-client/tree/master/src/generated/url-segments), compose tree structure like api. Path parameter will not turn into class.

All API endpoints:

* /restapi/v1.0/account/{accountId},
* /restapi/v1.0/account/{accountId}/active-calls,
* /restapi/v1.0/account/{accountId}/business-address,
* /restapi/v1.0/account/{accountId}/call-log,
* /restapi/v1.0/account/{accountId}/call-log/{callLogId},
* /restapi/v1.0/account/{accountId}/department/{departmentId}/members,
* /restapi/v1.0/account/{accountId}/device,
* /restapi/v1.0/account/{accountId}/device/{deviceId},
* /restapi/v1.0/account/{accountId}/dialing-plan,
* /restapi/v1.0/account/{accountId}/extension,
* /restapi/v1.0/account/{accountId}/extension/{extensionId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/active-calls,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/address-book-sync,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/address-book/contact,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/address-book/contact/{contactId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/address-book/group,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/address-book/group/{groupId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/answering-rule,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/answering-rule/{answeringRuleId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/authz-profile,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/authz-profile/check,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/blocked-number,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/blocked-number/{blockedNumberId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/business-hours,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/call-log,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/call-log-sync,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/call-log/{callLogId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/company-pager,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/conferencing,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/device,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/fax,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/forwarding-number,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/grant,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/greeting,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/greeting/{greetingId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/meeting,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/meeting/service-info,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/meeting/{meetingId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/meeting/{meetingId}/end,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/message-store,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/message-store/{messageId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/message-store/{messageId}/content/{attachmentId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/message-sync,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/phone-number,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/presence,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/profile-image,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/profile-image/{scaleSize},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/ringout,
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/ringout/{ringoutId},
* /restapi/v1.0/account/{accountId}/extension/{extensionId}/sms,
* /restapi/v1.0/account/{accountId}/order,
* /restapi/v1.0/account/{accountId}/order/{orderId},
* /restapi/v1.0/account/{accountId}/phone-number,
* /restapi/v1.0/account/{accountId}/phone-number/{phoneNumberId},
* /restapi/v1.0/account/{accountId}/recording/{recordingId},
* /restapi/v1.0/account/{accountId}/recording/{recordingId}/content,
* /restapi/v1.0/account/{accountId}/service-info,
* /restapi/v1.0/client-info/custom-data/{customDataKey},
* /restapi/v1.0/dictionary/country,
* /restapi/v1.0/dictionary/country/{countryId},
* /restapi/v1.0/dictionary/language,
* /restapi/v1.0/dictionary/language/{languageId},
* /restapi/v1.0/dictionary/location,
* /restapi/v1.0/dictionary/state,
* /restapi/v1.0/dictionary/state/{stateId},
* /restapi/v1.0/dictionary/timezone,
* /restapi/v1.0/dictionary/timezone/{timezoneId},
* /restapi/v1.0/number-parser/parse,
* /restapi/v1.0/number-pool/lookup,
* /restapi/v1.0/number-pool/reserve,
* /restapi/v1.0/subscription,
* /restapi/v1.0/subscription/{subscriptionId}


Generated ts code snippet of UrlSegment class `Extension`:
```typescript
import UrlSection from "../../UrlSection";
import AnsweringRule from "./AnsweringRule";
import Fax from "./Fax";

export default class Extension extends UrlSection {
    constructor(prv: UrlSection, id?: string, service?) {
        super("extension", id  || "~" , prv, service);
    }

    /**
     * Internal identifier of an answering rule. The value can be standard digital ID or specific ID - either business-hours-rule or after-hours-rule
     */
    answeringRule(id?: string) {
        return new AnsweringRule(this, id);
    }

    /**
     *
     */
    fax(id?: string) {
        return new Fax(this, id);
    }
}
```

## Operations
Add `list, get, post, put` methods to UrlSegment.

### List and get mothod

If the response schema of get operation is the same as [PagingResult](https://github.com/zengfenfei/ringcentral-js-client/blob/master/src/PagingResult.ts), this operation will generate `list` method instead of `get` method, and it will always return `Promise<PagingResult<{RecordsType}>>`.

Swagger snippet to generate list and get mehod:
```json
{
    "paths": {
        "/restapi/v1.0/account/{accountId}/extension": {
            "get": {
                "description": "Get Extension List",
                "responses": {
                    "default": {
                        "description": "OK",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "records": {
                                    "type": "array",
                                    "description": "List of extensions with extension information",
                                    "items": {
                                        "$ref": "#/definitions/ExtensionInfo"
                                    }
                                },
                                "navigation": {
                                    "$ref": "#/definitions/NavigationInfo",
                                    "description": "Information on navigation"
                                },
                                "paging": {
                                    "$ref": "#/definitions/PagingInfo",
                                    "description": "Information on paging"
                                }
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Indicates the page number to retrieve. Only positive number values are allowed. Default value is '1'",
                        "name": "page",
                        "in": "query"
                    }
                ]
            }
        },
        "/restapi/v1.0/account/{accountId}/extension/{extensionId}": {
            "get": {
                "description": "Get Extension Info by ID",
                "responses": {
                    "default": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/ExtensionInfo"
                        }
                    }
                }
            }
        }
    }
}
```

Generated ts code snippet:
```typescript
class Extension {
    /**
        Get Extension List
    */
    list(query?:ListQuery): Promise<PagingResult<ExtensionInfo>> {
        return this.getService().send({method: "get", url: this.getEndpoint(false), query: query, body: undefined }).then(function (res) {
            return res.json();
        });
    }

    /**
        Get Extension Info by ID
    */
    get(): Promise<ExtensionInfo> {
        return this.getService().send({method: "get", url: this.getEndpoint(true), query: undefined, body: undefined }).then(function (res) {
            return res.json();
        });
    }
}

// Inner class
export interface ListQuery {

    /**
     * Indicates the page size (number of items). If not specified, the value is '100' by default.
     */
    perPage?: number;

    /**
     * Extension current state. Multiple values are supported. If 'Unassigned' is specified, then extensions without extensionNumber are returned. If not specified, then all extensions are returned
     */
    status?: "Enabled" | "Disabled" | "NotActivated" | "Unassigned";
}

// Usage
client.account("theAccountId").extension('This will be ignored').list().then(function (extensions) {
    console.log("The list of extension info", extensions.records);
}).catch(function (e) {
    console.error("Get extension list error", e);
});

// If extension id is not provided, default value(@swagger.parameters) will be used.
client.account().extension('theExtensionId').get().then(function (extInfo) {
    console.log("The extension info", extInfo);
}).catch(function (e) {
    console.error("Get extension error", e);
});
```

### Post method
Post can have 3 forms of paramters: (body), (body, query), (query)

Swagger snippet:
```json
{
    "paths": {
        "/restapi/v1.0/account/{accountId}/extension/{extensionId}/sms": {
            "post": {
                "description": "Create and Send SMS Message",
                "responses": {
                    "default": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/MessageInfo"
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "body",
                        "in": "body",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "to": {
                                    "type": "array",
                                    "description": "Receiver of an SMS message. The phoneNumber property must be filled",
                                    "items": {
                                        "$ref": "#/definitions/CallerInfo"
                                    }
                                },
                                "text": {
                                    "type": "string",
                                    "description": "xx"
                                }
                            }
                        }
                    }
                ]
            }
        },
        "/restapi/v1.0/number-pool/lookup": {
            "post": {
                "description": "Look up Phone Number",
                "responses": {
                    "default": {
                        "description": "OK",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "records": {
                                    "type": "array",
                                    "description": "List of phone numbers filtered by the specified criteria",
                                    "items": {
                                        "$ref": "#/definitions/LookUpPhoneNumber.PhoneNumberInfo"
                                    }
                                }
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Area code of the location",
                        "name": "areaCode",
                        "in": "query"
                    }
                ]
            }
        },
        "/restapi/v1.0/number-parser/parse": {
            "post": {
                "description": "Parse Phone Number",
                "responses": {
                    "default": {
                        "description": "OK",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "phoneNumbers": {
                                    "type": "array",
                                    "description": "Parsed phone numbers data",
                                    "items": {
                                        "$ref": "#/definitions/ParsePhoneNumber.PhoneNumberInfo"
                                    }
                                }
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "type": "string",
                        "description": "xxx",
                        "name": "homeCountry",
                        "in": "query"
                    },
                    {
                        "name": "body",
                        "in": "body",
                        "schema": {
                            "type": "object",
                            "properties": {
                                "originalStrings": {
                                    "type": "array",
                                    "description": "xxx",
                                    "items": {
                                        "type": "string"
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
}
```

Generated ts code snippet:
```typescript
//==================
// send SMS
import UrlSection from "../../UrlSection";
import {MessageInfo} from "../MessageInfo";
import {CallerInfo} from "../CallerInfo";

export default class Sms extends UrlSection {
    constructor(prv: UrlSection, id?: string, service?) {
        super("sms", id , prv, service);
    }

    /**
        Create and Send SMS Message
    */
    post(body: PostBody): Promise<MessageInfo> {
        return this.getService().send({method: "post", url: this.getEndpoint(true), query: undefined, body: body }).then(function (res) {
            return res.json();
        });
    }
}

export interface PostBody {

    /**
     * Receiver of an SMS message. The phoneNumber property must be filled
     */
    to?: CallerInfo[];

    /**
     * xxx
     */
    text?: string;
}

//==================
// lookup phone number
import UrlSection from "../../UrlSection";
import {LookUpPhoneNumberPhoneNumberInfo} from "../LookUpPhoneNumberPhoneNumberInfo";

export default class Lookup extends UrlSection {
    constructor(prv: UrlSection, id?: string, service?) {
        super("lookup", id , prv, service);
    }

    /**
        Look up Phone Number
    */
    post(query?:PostQuery): Promise<PostResponse> {
        return this.getService().send({method: "post", url: this.getEndpoint(true), query: query, body: undefined }).then(function (res) {
            return res.json();
        });
    }
}

export interface PostQuery {

    /**
     * Area code of the location
     */
    areaCode?: number;
}

export interface PostResponse {

    /**
     * List of phone numbers filtered by the specified criteria
     */
    records?: LookUpPhoneNumberPhoneNumberInfo[];
}

//==================
// parse phone number
import UrlSection from "../../UrlSection";
import {ParsePhoneNumberCountryInfo} from "../ParsePhoneNumberCountryInfo";
import {ParsePhoneNumberPhoneNumberInfo} from "../ParsePhoneNumberPhoneNumberInfo";

export default class Parse extends UrlSection {
    constructor(prv: UrlSection, id?: string, service?) {
        super("parse", id , prv, service);
    }

    /**
        Parse Phone Number
    */
    post(body: PostBody, query?:PostQuery): Promise<PostResponse> {
        return this.getService().send({method: "post", url: this.getEndpoint(true), query: query, body: body }).then(function (res) {
            return res.json();
        });
    }
}

export interface PostBody {

    /**
     * Phone numbers passed in a string. The maximum value of phone numbers is limited to 64. The maximum number of symbols in each phone number in a string is 64
     */
    originalStrings?: string[];
}

export interface PostQuery {

    /**
     * Internal identifier of a home country. The default value is ISO code (ISO 3166) of the user's home country or brand country, if the user is undefined
     */
    homeCountry?: string;
}

export interface PostResponse {

    /**
     * Parsed phone numbers data
     */
    phoneNumbers?: ParsePhoneNumberPhoneNumberInfo[];
}
```

## Special case - parameter type of put extension
In general, an inner ts interface (named as `{MethodName}{ParameterType}`, e.g. `PutBody`, `ListQuery`) may be generated for parameter type(except for definition reference) of operation methods. But the parameter type for put extension can be several types, so instead of ts inner interface, an alias of ts union type is generated.

Swagger snippet:
```
"/restapi/v1.0/account/{accountId}/extension/{extensionId}": {
    "put": {
        "description": "Update Extension by ID",
        "responses": {
            "default": {
                "description": "OK",
                "schema": {
                    "$ref": "#/definitions/ExtensionInfo"
                }
            }
        },
        "parameters": [
            {
                "name": "body",
                "in": "body",
                "schema": {
                    "type": "object",
                    "enum": [
                        {
                            "$ref": "#/definitions/ExtensionInfo.Request.StatusInfo"
                        },
                        {
                            "$ref": "#/definitions/ExtensionInfo.Request.ContactInfo"
                        },
                        {
                            "$ref": "#/definitions/ExtensionInfo.Request.PasswordPIN"
                        },
                        {
                            "$ref": "#/definitions/ExtensionInfo.Request.PartnerId"
                        },
                        {
                            "$ref": "#/definitions/ExtensionInfo.Request.Provision"
                        }
                    ]
                }
            }
        ]
    }
}
```

Generated ts code snippet:
```typescript
import UrlSection from "../../UrlSection";
import {ExtensionInfoRequestContactInfo} from "../ExtensionInfoRequestContactInfo";
import {ExtensionInfoRequestPasswordPIN} from "../ExtensionInfoRequestPasswordPIN";
import {ExtensionInfoRequestPartnerId} from "../ExtensionInfoRequestPartnerId";
import {ExtensionInfoRequestProvision} from "../ExtensionInfoRequestProvision";

export default class Extension extends UrlSection {

    /**
        Update Extension by ID
    */
    put(body: PutBody): Promise<ExtensionInfo> {
        return this.getService().send({method: "put", url: this.getEndpoint(true), query: undefined, body: body }).then(function (res) {
            return res.json();
        });
    }
}

type PutBody = ExtensionInfoRequestContactInfo | ExtensionInfoRequestPasswordPIN | ExtensionInfoRequestPartnerId | ExtensionInfoRequestProvision;
```

## Configurations

The rc-codegen is designed to be general purposed, but there are some special cases that the auto generated code does not work, so we allow users to pass in configurations.

A sample configuration file to generate custome operation method body.
```
{
    "customOperations": {
        "ProfileImage": {
            "put": {
                "imports": {
                    "* as FormData": "form-data"
                },
                "body": "./put-profile-image.ts-method-body"
            },
            "post": {
                "imports": {
                    "* as FormData": "form-data"
                },
                "body": "./put-profile-image.ts-method-body"
            }
        },
        "Fax": {
            "post": {
                "imports": {
                    "* as FormData": "form-data",
                    "Binary": "../../Binary"
                },
                "body": "./post-fax.ts-method-body"
            }
        }
    }
}
```


## Custom methods body
Some operation methods need custom body, it's achieved by the config file.

This configuration file will result in a UrlSegment class of `ProfileImage` with a custom body for `put` method.
```json
{
    "customOperations": {
        "ProfileImage": {
            "put": {
                "imports": {
                    "* as FormData": "form-data"
                },
                "body": "./put-profile-image.ts-method-body"
            }
        }
}
```

File content of `./put-profile-image.ts-method-body`:
```typescript
(imageData: Binary, contentType = "image/png"): Promise<void> {
        var form = new FormData();
        form.append("image", imageData, { contentType: contentType, filename: "profile." + contentType.split('/').pop() });
        return this.getService().put(this.getEndpoint(), form).then( res=>{});
    }
```

Generated ts code snippet:
```typescript
import UrlSection from "../../UrlSection";
import Binary from "../../Binary";
import * as FormData from "form-data";

export default class ProfileImage extends UrlSection {

    /**
        Update Profile Image
    */
    put(imageData: Binary, contentType = "image/png"): Promise<void> {
        var form = new FormData();
        form.append("image", imageData, { contentType: contentType, filename: "profile." + contentType.split('/').pop() });
        return this.getService().put(this.getEndpoint(), form).then( res=>{});
    }
}

```

## Brief implemention logic of ts codegen

The basic idea is simple, render a template file with data, generate a source file. For definitions, the template file is `views/Definition.njk`, the data is defined by `Definition.ts`. For url segments, the template file is `UrlSegment.njk`, the data is defined by `UrlSegment.ts`.

### Main steps

1. Create `Definition`, pass sawagger definition to `Definition` constructor: `new Definition(swaggerDefinition, name)`.
2. Create `UrlSegment`:
    1. Generate UrlSegments without operations: `gen-segments.ts`.
    2. Add operations to genearated UrlSegments: `gen-operations.ts`.
