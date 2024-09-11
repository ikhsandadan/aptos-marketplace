import { useState } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { makeStyles } from '@mui/styles';
import { TextField, Card, CardActions, CardContent, CardMedia, CircularProgress } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';

import { NFT, useAppContext } from '../context/AppContext';
import { useUserContext } from '../context/UserContext';

const useStyles = makeStyles({
    root: {
        flexDirection: 'column',
        display: 'flex',
        margin: '15px 15px',
        flexGrow: 1
    },
    cardActions: {
        marginTop: 'auto'
    },
    media: {
        height: 0,
        paddingTop: '56.25%',
        cursor: 'pointer'
    }
});

const defaultFileUrl = 'https://miro.medium.com/max/250/1*DSNfSDcOe33E2Aup1Sww2w.jpeg';

const NFTCardCreation = () => {
    const { adminAccount, uploadImageToIPFS, handleMintNft } = useAppContext();
    const { userAddress } = useUserContext();
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(defaultFileUrl);
    const classes = useStyles();
    const { register, handleSubmit, reset } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [category, setCategory] = useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value as string);
    };

    const onFileChange = (event: any) => {
        if (!event.target.files[0]) return;
        setFile(event.target.files[0]);
        setFileUrl(URL.createObjectURL(event.target.files[0]));
    };

    const mintNFT = async (name: string, description: string, category: string, metadataUrl: string) => {
        const nftData: NFT = {
            name: name,
            image: metadataUrl,
            description: description,
            category: category
        };

        if (adminAccount && userAddress) {
            const txHash = await handleMintNft(adminAccount, userAddress, nftData);
        } else {
            console.log('Please connect your wallet');
        }
    };

    const onSubmit: SubmitHandler<FieldValues> = async (data: FieldValues) =>  {
        try {
            if (!file || isLoading) return;

            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('category', category);
            formData.append('file', file);

            setIsLoading(true);
            const metadataUrl = await uploadImageToIPFS(formData);

            await mintNFT(data.name, data.description, category, metadataUrl);

            setFileUrl(defaultFileUrl);
            setCategory('');
            reset();
        } catch (error: any) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <Card className={`${classes.root} max-h-max`} component="form" sx={{ maxWidth: 345 }} onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="file-input">
            <CardMedia
                className={classes.media}
                title='Upload image'
                image={fileUrl}
                sx={{ cursor: 'pointer' }}
            />
        </label>
        <input
            style={{ display: 'none' }}
            type="file"
            name="file"
            id="file-input"
            onChange={onFileChange}
            />
        <CardContent sx={{ paddingBottom: 0 }}>
            <TextField
                id="name-input"
                label="name"
                size="small"
                fullWidth
                required
                margin="dense"
                disabled={isLoading}
                {...register('name')}
            />
            <TextField
                id="description-input"
                label="description"
                size="small"
                multiline
                rows={2}
                fullWidth
                required
                margin="dense"
                disabled={isLoading}
                {...register('description')}
            />
            <FormControl fullWidth margin="dense">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
                labelId="category"
                id="category"
                value={category}
                label="category"
                disabled={isLoading}
                onChange={handleChange}
            >
                <MenuItem value={'Artwork'}>Artwork</MenuItem>
                <MenuItem value={'Meme'}>Meme</MenuItem>
                <MenuItem value={'Photography'}>Photography</MenuItem>
            </Select>
            </FormControl>
        </CardContent>
        <CardActions className='flex justify-center items-center content-center'>
            <button type="submit" className='bg-slate-500 mb-2 p-2 border border-slate-500 rounded-md text-white hover:bg-white hover:text-slate-500 transition ease-in-out 300ms'>
            {isLoading
                ? <CircularProgress size="20px" className='text-white mb-0'/>
                : 'Create'
            }
            </button>
        </CardActions>
        </Card>
    )
};

export default NFTCardCreation;