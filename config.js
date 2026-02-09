// Конфигурация для опциональной интеграции с Supabase
// По умолчанию используется LocalStorage
window.CONFIG = {
  // Установите true для использования Supabase вместо LocalStorage
  USE_SUPABASE: false,

  // Supabase настройки (заполните, если USE_SUPABASE = true)
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',

  // Настройки локализации
  DEFAULT_LOCALE: 'ru',

  // CDN настройки
  USE_CDN_IMAGES: true,  // false = использовать только локальные изображения
};