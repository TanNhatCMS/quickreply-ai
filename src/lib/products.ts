export interface HomeProduct {
  id: string
  name: string
  brand: 'Asus' | 'Acer' | 'Lenovo' | 'HP' | 'MSI'
  category: 'laptop' | 'apple' | 'pc' | 'component' | 'monitor' | 'accessory' | 'network'
  price: number
  originalPrice: number
  discount: string
  image: string
  specs: {
    cpu: string
    gpu: string
    ram: string
    storage: string
  }
}

export interface HomeCategory {
  name: string
  icon: string
  slug: string
}

export const homeCategories: HomeCategory[] = [
  { name: 'Laptop', icon: 'laptop_mac', slug: 'laptop' },
  { name: 'Apple', icon: 'phone_iphone', slug: 'apple' },
  { name: 'PC', icon: 'desktop_windows', slug: 'pc' },
  { name: 'Linh Kiện', icon: 'memory', slug: 'component' },
  { name: 'Màn Hình', icon: 'monitor', slug: 'monitor' },
  { name: 'Phụ Kiện', icon: 'headphones', slug: 'accessory' },
  { name: 'Thiết Bị Mạng', icon: 'router', slug: 'network' },
]

export const homeProducts: HomeProduct[] = [
  {
    id: 'prod-lenovo-loq',
    name: 'Laptop Lenovo LOQ Essential 15ARP10E',
    brand: 'Lenovo',
    category: 'laptop',
    price: 25990000,
    originalPrice: 35990000,
    discount: 'TIẾT KIỆM 10M',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLuMC9sjeAd036JM0YmWrrQOSDjrqxtbdrGs8M1D1KcRqG1gIRnbuTSFTqJk1q8fvTdp833HLH0ln1FAiNfcEqzvJQfe05sQ3ilsLXSje5ZAhD-4v14xCqANjmcrEMlWwxfT7nRgTxh8t0jyg0LKSU9sCj3ENjgjvQSnVp7ppAFucZoGEReNZHSUELm_OClJp1i0lvxjKxg8qqKZwE-fCEBBP_YzGFwBerkSbi0nRlvSvi1ZHq6IBuxKMm-V',
    specs: { cpu: 'Ryzen 5 7535HS', gpu: 'RTX™ 3050', ram: '16GB RAM', storage: '512GB SSD' },
  },
  {
    id: 'prod-acer-aspire',
    name: 'Laptop Acer Aspire Go 15 AG15-72P',
    brand: 'Acer',
    category: 'laptop',
    price: 19490000,
    originalPrice: 24990000,
    discount: 'TIẾT KIỆM 5.5M',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtuJWZc1INbK7nQEoyH4EFNKzHzUTHGq-VWasN65xFjFxmGQQMo1yUfpEc3LM3Ko8WjlMPvt0GxhENZgm81_OmCEeeSRlIMX-zsszhCkn4wBZYGqzL1RJXPCD9XOfFqPKIe-5P-BY137DIYzzcRxxxTvduYMLsE19i1_pxC3LNeIVa5DyjqGkLrmXMAWiOmno89bPc-C3u7-0AHOT3IuH4t5WraQE9zhPFNdpS4Nc5fDMu6WC4p5WQrHpwt',
    specs: { cpu: 'Core 5 120U', gpu: 'Intel UHD', ram: '16GB RAM', storage: '512GB SSD' },
  },
  {
    id: 'prod-hp-14',
    name: 'Laptop HP 14-ep1007TU - 9Z2W1PA',
    brand: 'HP',
    category: 'laptop',
    price: 23990000,
    originalPrice: 27990000,
    discount: 'TIẾT KIỆM 4M',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLu3Od5GTno2cQYIne3ner1kHDtvr2778iHG0c4otk1-5gtUAeua1yOWgOm3orYtFdIbw3SWwfmGPqdIcaBE_3oQZAAmye3nAPbJ803PXs_wtPsrjdgU7YSksTG4SdAQBNSLHkOZXJIhUONxpri_Yno4MdJJqo3j0esZnwdQ3BFnYUcMsdCeVeAHWV3XNeDo0hdhkQUwikTNV7XeyYqaBkW3_JU02RsyCYwGB9earnUTk7ILUScWRGvpOoXA',
    specs: { cpu: 'Core i7 150U', gpu: 'Intel Iris Xe', ram: '16GB RAM', storage: '512GB SSD' },
  },
  {
    id: 'prod-hp-victus',
    name: 'Laptop HP Victus 15-fb3115AX',
    brand: 'HP',
    category: 'laptop',
    price: 27990000,
    originalPrice: 31690000,
    discount: 'TIẾT KIỆM 3.7M',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsHFckuEunC0iF-ZTcnnVjUYdSEBPtThRTddpgRxB9fDiAb49HSn-HFaq_ZYHm5YpVfhYHMYnm2deq578q2NogaD7JviKhbzQb_9JMgp5kB0Vyhk0jfKvluV7f7MMIqKgyrTexSo1orz46T-7jFSDzbkDqfDixQBo9NtcKhs1GZ1c3Z5C3zOCJ2kVl9R0HU8s3hlHHIm1zXd_Ih6BEsNLom-fLMzJ7s8M8QB6OF3b8kWYcF2JUsDPPG2Fj8',
    specs: { cpu: 'Ryzen 7 7445HS', gpu: 'RTX™ 4050', ram: '16GB RAM', storage: '512GB SSD' },
  },
  {
    id: 'prod-msi-modern',
    name: 'Laptop Msi Modern 15 F13MG-667VN',
    brand: 'MSI',
    category: 'laptop',
    price: 18190000,
    originalPrice: 18990000,
    discount: 'TIẾT KIỆM 800K',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvQpxpOMrbWqcRdH7ikk3-LAjE6bbT27vINHLG2TWPaYtN8cv71M8HZTMduAXCtMektsLjw2F9v2775gmtSP8HRCEm9GRNVWC78OHN-8jvdmWDRVi8Td7E5KN3MSaWjpr4EA3GBcKdZRrPE3tNWisAqORnnItg7u4s48knzD5K70onSi7LCGcqvlHTLs9rvqZDJmYnv4wrrBmThZeyYMKDglEPDvAgdGxIp8A7lWf3-zttr83lC0wizQIxO',
    specs: { cpu: 'Core i5-1334U', gpu: 'Intel Iris Xe', ram: '16GB RAM', storage: '512GB SSD' },
  },
]
