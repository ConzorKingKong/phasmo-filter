import { useApp } from '../../context/AppContext'
import { Card, CardContent, Typography, Box, Link } from '@mui/material'

export default function FeedPanel() {
  const { feed } = useApp()

  if (!feed || feed.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>No feed items available.</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {feed.map((item) => (
        <Card key={item.title} sx={{ mb: 2, bgcolor: 'grey.800', '&:hover': { boxShadow: 6 } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {item.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {item.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {item.date}
            </Typography>
            <Link href={item.link} target="_blank" rel="noopener noreferrer">
              Read More
            </Link>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
} 