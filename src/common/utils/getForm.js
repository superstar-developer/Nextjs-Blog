import formidable from "formidable";

/**
 * Accepts post form data
 * @param request
 * @return {Promise<{files: object, fields: object}>}
*/
const getForm = (request) => {

    return new Promise( async (resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.keepExtensions = true;
        
        form.parse(request, (err, fields, files) => {
            if (err) {
                return reject(err);

            } else {
                resolve({ files, fields });
            }

        });
    });
}

export default getForm