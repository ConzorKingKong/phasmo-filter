import {
  Drawer,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material'
import { useApp } from '../../context/AppContext'

const settingsLabels = {
  volume: { en: 'Volume', es: 'Volumen', fr: 'Volume', de: 'Lautstärke' },
  ghostSpeed: { en: 'Ghost Speed', es: 'Velocidad del Fantasma', fr: 'Vitesse du Fantôme', de: 'Geistergeschwindigkeit' },
  showDescriptions: { en: 'Show Ghost Descriptions', es: 'Mostrar Descripciones de Fantasmas', fr: 'Afficher les Descriptions des Fantômes', de: 'Geisterbeschreibungen anzeigen' },
  compactView: { en: 'Compact View', es: 'Vista Compacta', fr: 'Vue Compacte', de: 'Kompaktansicht' },
  language: { en: 'Language', es: 'Idioma', fr: 'Langue', de: 'Sprache' },
  settings: { en: 'Settings', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen' },
  version: { en: 'Version', es: 'Versión', fr: 'Version', de: 'Version' },
}

const languageOptions = [
  { value: 'en', label: { en: 'English', es: 'Inglés', fr: 'Anglais', de: 'Englisch' } },
  { value: 'es', label: { en: 'Spanish', es: 'Español', fr: 'Espagnol', de: 'Spanisch' } },
  { value: 'fr', label: { en: 'French', es: 'Francés', fr: 'Français', de: 'Französisch' } },
  { value: 'de', label: { en: 'German', es: 'Alemán', fr: 'Allemand', de: 'Deutsch' } },
]

const settings = {
  volume: {
    type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 50,
  },
  ghostSpeed: {
    type: 'slider',
    min: 50,
    max: 150,
    step: 25,
    defaultValue: 100,
  },
  showDescriptions: {
    type: 'switch',
    defaultValue: true,
  },
  compactView: {
    type: 'switch',
    defaultValue: false,
  },
  language: {
    type: 'select',
    options: languageOptions,
    defaultValue: 'en',
  },
}

function getLocalizedString(val, lang) {
  if (typeof val === 'object' && val !== null) {
    return val[lang] || val['en'] || Object.values(val)[0]
  }
  return val
}

export default function SettingsPanel({ open, onClose }) {
  const { settings: ctxSettings, updateSettings } = useApp()
  const language = ctxSettings.language

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {getLocalizedString(settingsLabels.settings, language)}
        </Typography>

        {Object.entries(settings).map(([key, setting]) => (
          <Box key={key} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {getLocalizedString(settingsLabels[key], language)}
            </Typography>

            {setting.type === 'slider' && (
              <Slider
                value={ctxSettings[key]}
                min={setting.min}
                max={setting.max}
                step={setting.step}
                valueLabelDisplay="auto"
                marks={[
                  { value: setting.min, label: `${setting.min}%` },
                  { value: setting.max, label: `${setting.max}%` },
                ]}
                onChange={(_, value) => updateSettings(key, value)}
              />
            )}

            {setting.type === 'switch' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!ctxSettings[key]}
                    onChange={(_, checked) => updateSettings(key, checked)}
                  />
                }
                label={getLocalizedString(settingsLabels[key], language)}
              />
            )}

            {setting.type === 'select' && (
              <FormControl fullWidth size="small">
                <Select
                  value={ctxSettings[key]}
                  onChange={e => updateSettings(key, e.target.value)}
                >
                  {setting.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {getLocalizedString(option.label, language)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          {getLocalizedString(settingsLabels.version, language)} 1.0.0
        </Typography>
      </Box>
    </Drawer>
  )
} 