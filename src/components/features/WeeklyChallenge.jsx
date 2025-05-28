import { useApp } from '../../context/AppContext'
import { Card, CardContent, Typography, Box } from '@mui/material'

export default function WeeklyChallenge() {
  const { weekly } = useApp()

  if (!weekly) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>No weekly challenge available.</Typography>
      </Box>
    )
  }

  return (
    <Card sx={{ bgcolor: 'grey.800', '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {weekly.challenge}
        </Typography>
        <Typography variant="body1" paragraph>
          {weekly.description}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Map: {weekly.map}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Player Speed: {weekly.details.playerSpeed}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ghost Speed: {weekly.details.ghostSpeed}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Evidence: {weekly.details.evidence}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cursed Objects: {weekly.details.cursedObjects}
        </Typography>
      </CardContent>
    </Card>
  )
} 