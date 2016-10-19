/**
 * Test if response is a list, then use PagingResult as model
 */
export default function (schema): boolean {
    var props = schema.properties;
    if (schema.type == "object" && props && props.records && props.navigation && props.paging) {
        return true;// "PageResult";
    }
}