import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function UploadMultimediaCard() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <Card sx={{ maxWidth: 345 }}>
      <Alert variant="filled" severity="warning">
        Media Type: Image
      </Alert>
      <CardMedia
        component="img"
        height="250"
        image="data:image/jpeg;base64,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"
        alt="Spooderman"
      />

      <CardActions disableSpacing>
        <IconButton aria-label="Delete image">
          <DeleteIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Method:</Typography>
          <Typography paragraph>
            Heat 1/2 cup of the broth in a pot until simmering, add saffron and
            set aside for 10 minutes.
          </Typography>
          <Typography paragraph>
            Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet
            over medium-high heat. Add chicken, shrimp and chorizo, and cook,
            stirring occasionally until lightly browned, 6 to 8 minutes.
            Transfer shrimp to a large plate and set aside, leaving chicken and
            chorizo in the pan. Add pimentón, bay leaves, garlic, tomatoes,
            onion, salt and pepper, and cook, stirring often until thickened and
            fragrant, about 10 minutes. Add saffron broth and remaining 4 1/2
            cups chicken broth; bring to a boil.
          </Typography>
          <Typography paragraph>
            Add rice and stir very gently to distribute. Top with artichokes and
            peppers, and cook without stirring, until most of the liquid is
            absorbed, 15 to 18 minutes. Reduce heat to medium-low, add reserved
            shrimp and mussels, tucking them down into the rice, and cook again
            without stirring, until mussels have opened and rice is just tender,
            5 to 7 minutes more. (Discard any mussels that don&apos;t open.)
          </Typography>
          <Typography>
            Set aside off of the heat to let rest for 10 minutes, and then
            serve.
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
