import cloudinary from "cloudinary"
import getForm from "common/utils/getForm";

cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_APIKEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_APISECRET,
});

let public_id = ''
const blog = async (req, res) => {
    if (req.method === 'POST') {
        const { files } = await getForm(req)
        try {
            let image = files['photo'] || {}
            await cloudinary.v2.uploader.upload(image.path, (err, result) => {
                if (err) {
                    return res.status(403).send("image upload faild");
                }
                public_id = result.public_id
                return res.status(200).send({
                    success: 1,
                    file: {
                        url: result.url
                    }
                })
            })
        } catch (error) {
            res.status(402).send("can't upload the Image")
        }
    } else if (req.method === 'GET') {
        console.log("imageUrl", public_id)
        res.status(200).send({public_id})
    } else {
        res.status(200).send('Image Upload API')
    }
}

export const config = {
    api: {
        bodyParser: false
    }
}

export default blog