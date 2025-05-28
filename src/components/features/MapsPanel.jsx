import { useApp } from '../../context/AppContext'
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material'

export default function MapsPanel() {
  const { maps } = useApp()

  if (!maps || maps.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>No maps available.</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={2}>
      {maps.map((map) => (
        <Grid item xs={12} sm={6} md={4} key={map.div_id}>
          <Card sx={{ bgcolor: 'grey.800', '&:hover': { boxShadow: 6 } }}>
            <CardMedia
              component="img"
              height="140"
              image={map.file_url}
              alt={map.name}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {map.name}
              </Typography>
              {map.extra && (
                <Typography variant="body2" color="text.secondary">
                  {map.extra}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
} 