import UrlSegment from './UrlSegment';

let ignoredUrlSections = ['restapi', 'v1.0'];
export default function genUrlSegments(endpoints: string[], parameters): { [name: string]: UrlSegment } {
    let classes: { [urlName: string]: UrlSegment } = {};
    let classNames = [];
    for (let i = 0; i < endpoints.length; i++) {
        let prvSec: UrlSegment;
        let prvPartIsValue = false;
        let parts = endpoints[i].substring(1).split('/');
        for (let j = 0; j < parts.length; j++) {
            let urlPart = parts[j];
            if (ignoredUrlSections.indexOf(urlPart) > -1) {
                continue;
            }
            if (prvSec) {
                let matched = urlPart.match(/^{(.+)}$/);    // This part is parameter
                if (matched) {
                    prvSec.defaultValue = parameters[matched[1]].default;
                    prvSec.valueDesc = parameters[matched[1]].description;
                }
                let isValue = !!matched;
                if (isValue && !prvPartIsValue) {
                    prvSec.allowValue();
                } else if (!isValue && !prvPartIsValue) {
                    prvSec.forbidValue();
                }
                prvPartIsValue = isValue;
                if (isValue) {
                    continue;
                }
            }

            let cls = classes[urlPart];
            if (!cls) {
                cls = new UrlSegment(urlPart);
                classes[urlPart] = cls;
                if (classNames.indexOf(cls.name) > -1) {
                    console.error('A url segment with name ' + cls.name + ' already exists.');
                    break;
                }
                classNames.push(cls.name);
            }

            if (prvSec) {
                prvSec.addChild(cls);
            }
            prvSec = cls;
        }
        if (prvSec && !prvPartIsValue) {
            prvSec.forbidValue();
        }
    }
    return classes;
};