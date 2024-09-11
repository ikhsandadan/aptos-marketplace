import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

const pinataBaseUrl = 'https://api.pinata.cloud';

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        const fileBuffer = await file.arrayBuffer();
        const fileData = Buffer.from(fileBuffer);

        const pinataFormData = new FormData();
        pinataFormData.append('file', fileData, {
            filename: name,
            contentType: file.type,
        });

        const { data: fileUploadResponse } = await axios.post(
        `${pinataBaseUrl}/pinning/pinFileToIPFS`,
        pinataFormData,
        {
            headers: {
                ...pinataFormData.getHeaders(),
                pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
                pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        }
        );

        const fileUrl = `https://amethyst-implicit-silkworm-944.mypinata.cloud/ipfs/${fileUploadResponse.IpfsHash}`;

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('Error processing upload:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};