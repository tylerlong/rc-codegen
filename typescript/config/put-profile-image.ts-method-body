(imageData: Binary, contentType = "image/png"): Promise<void> {
        var form = new FormData();
        form.append("image", imageData, { contentType: contentType, filename: "profile." + contentType.split('/').pop() });
        return this.getService().put(this.getEndpoint(), form).then( res=>{});
    }