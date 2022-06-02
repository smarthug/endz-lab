import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';

import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import useMediaQuery from '@mui/material/useMediaQuery';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

// export default function BasicModal({ open, handleClose }) {

//     return (

//         <Modal
//             open={open}
//             onClose={handleClose}
//             aria-labelledby="modal-modal-title"
//             aria-describedby="modal-modal-description"
//         >
//             <Box sx={style}>
//                 <Typography id="modal-modal-title" variant="h6" component="h2">
//                     Text in a modal
//                 </Typography>
//                 <Typography id="modal-modal-description" sx={{ mt: 2 }}>
//                     Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
//                 </Typography>
//             </Box>
//         </Modal>

//     );

// }

export default function BasicModal({ open, handleClose }) {

    return (

        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <TitlebarImageList />
            </Box>
        </Modal>

    );

}

function TitlebarImageList() {
    const matches = useMediaQuery('(min-width:600px)');

    return (
        <ImageList sx={{ width: '100%', height: 450 }}>
            <ImageListItem key="Subheader" cols={matches ? 4 : 2}>
                <ListSubheader component="div">Apps</ListSubheader>
            </ImageListItem>
            {itemData.map((item) => (
                <ImageListItem
                    key={item.img}
                    onClick={() => {
                        if (item.url !== undefined) {

                            window.open(item.url)
                        } else {
                            alert("WIP / 준비 중")
                        }
                    }}
                >
                    <img
                        src={`${item.img}?w=248&fit=crop&auto=format`}
                        srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                        alt={item.title}
                        loading="lazy"
                    />
                    <ImageListItemBar
                        title={item.title}
                        // subtitle={item.author}
                        actionIcon={
                            <IconButton
                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                aria-label={`info about ${item.title}`}
                            >
                                <InfoIcon />
                            </IconButton>
                        }
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

const itemData = [
    {
        title: "Crypto/코인",
        img: "https://miro.medium.com/max/3150/1*b7E3KUdA2dY2TP2P9Q8O-Q.png",
        rows: 2,
        cols: 2,
        url:"https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC"
    },
    {
        title: "Stock/주식",
        img: "https://blog.kakaocdn.net/dn/shyL3/btqS29xhOK7/0olO3p9In3LuOkeRU8wc8K/img.png",
        rows: 2,
        cols: 2,
        url:"https://www.ustockplus.com/"
    },
    {
        img: 'https://static.hogangnono.com/img/h_appicon_rounded_192.png',
        title: 'Real Estate/부동산',
        author: '@arwinneil',
        rows: 2,
        cols: 2,
        featured: true,
        url:"https://hogangnono.com/"
    },
    {
        title: "Loan/대출",
        img:"http://www.sisaweek.com/news/thumbnail/202006/134535_124257_4625_v150.jpg",
        rows: 2,
        cols: 2,
        url:"https://xn--vk1bq81cx0d.com/"
    },
    {
        img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
        url: "https://race.kra.co.kr/seoulMain.do",
        title: '경마',
        author: '@bkristastucchio',
        rows: 2,
        cols: 2,
        featured: true,
    },
    {
        img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
        title: '주사위 게임',
        author: '@rollelflex_graphy726',
    },
    {
        img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
        title: '섯다',
        author: '@helloimnik',
    },
    {
        img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
        title: '몬티셀 게임 / ',
        author: '@nolanissac',
        cols: 2,
    },
    {
        img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
        title: '아이템 강화',
        author: '@hjrc33',
        cols: 2,
    },

    {
        img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
        title: '포커',
        author: '@tjdragotta',
    },
    {
        img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
        url: 'https://endz-lab.vercel.app/KameHouse',
        title: 'Kamehouse',
        author: '@katie_wasserman',
    },
    {
        img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
        url: 'https://endz-lab.vercel.app/Pysics2DGame',
        title: 'Box Factory',
        author: '@silverdalex',
        rows: 2,
        cols: 2,
    },
    {
        img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
        url: 'https://endz-lab.vercel.app/NoPhysicsGame',
        title: 'MMO RPG',
        author: '@shelleypauls',
    },
    {
        img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
        title: 'Sea star',
        author: '@peterlaster',
    },
    {
        img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
        title: 'Go Outside/외출',
        author: '@southside_customs',
        cols: 2,
    },
];


// const itemData = [
//     {
//         title: "Upbit/업비트",
//         img:"https://miro.medium.com/max/3150/1*b7E3KUdA2dY2TP2P9Q8O-Q.png",
//         rows: 2,
//         cols: 2,
//     },
//     {
//         title: "Stock/주식",
//         img:"https://blog.kakaocdn.net/dn/shyL3/btqS29xhOK7/0olO3p9In3LuOkeRU8wc8K/img.png",
//         rows: 2,
//         cols: 2,
//     },
//     {
//         title: "Loan/대출",
//         // img:"https://cdn-icons-png.flaticon.com/512/5256/5256228.png",
//         rows: 2,
//         cols: 2,
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
//         title: 'Breakfast',
//         author: '@bkristastucchio',
//         rows: 2,
//         cols: 2,
//         featured: true,
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
//         title: 'Burger',
//         author: '@rollelflex_graphy726',
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
//         title: 'Camera',
//         author: '@helloimnik',
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
//         title: 'Coffee',
//         author: '@nolanissac',
//         cols: 2,
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
//         title: 'Hats',
//         author: '@hjrc33',
//         cols: 2,
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
//         title: 'Honey',
//         author: '@arwinneil',
//         rows: 2,
//         cols: 2,
//         featured: true,
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
//         title: 'Basketball',
//         author: '@tjdragotta',
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
//         title: 'Fern',
//         author: '@katie_wasserman',
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
//         title: 'Mushrooms',
//         author: '@silverdalex',
//         rows: 2,
//         cols: 2,
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
//         title: 'Tomato basil',
//         author: '@shelleypauls',
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
//         title: 'Sea star',
//         author: '@peterlaster',
//     },
//     {
//         img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
//         title: 'Bike',
//         author: '@southside_customs',
//         cols: 2,
//     },
// ];
