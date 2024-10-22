"use server"
import { auth } from '@clerk/nextjs/server'
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createPresentationSkeleton(options) {
    const { userId } = auth()
    const {data, error} = await supabase
        .from('presentations')
        .insert({
        title: options.title,
        user_id: userId
    })
        .select('id')
        .single()
    return data
}

export async function uploadImages(skeleton, images) {
    // Upload each image to bucket and create an entry in slides associated with the skeleton id
    // const {data, error} = await supabase
    //     .storage
    //     .from('presentations')
    //     .upload(`presentations/${skeleton}`, images)
    let index = 0
    for (const image of images) {
        // Extract the base64 part of the data URL
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Decode the base64 string into a buffer
        const buffer = Buffer.from(base64Data, 'base64');

        const { data, error } = await supabase
            .storage
            .from('presentations')
            .upload(`/${skeleton}/${index}`, buffer, {
                contentType: 'image/jpeg'
            });

        console.log(data)
        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`
        const {data: slideData, error: slideError} = await supabase
            .from('slides')
            .insert({
                presentation_id: skeleton,
                image_url: imageUrl,
                slide_number: index
            })
        console.log(slideError)
        if (error) {
            console.error("Error uploading image:", error);
        } else {
            console.log("Uploaded Image");
        }

        index++;
    }
}
