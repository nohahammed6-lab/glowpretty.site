import { CategoryItem, Service, Review, GalleryItem, SiteSettings, AboutContent, Supervisor, Coupon, Appointment } from '../types';

export const TIME_SLOTS: string[] = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    "arabicLabel": "العناية بالشعر والتساريح",
    "label": "Hair Care & Styling",
    "id": "hair"
  },
  {
    "id": "skincare",
    "label": "Skin & Body Care",
    "arabicLabel": "العناية بالبشرة والجسم"
  },
  {
    "id": "nails",
    "arabicLabel": "الأظافر ونقش الحناء",
    "label": "Nails & Henna Art"
  },
  {
    "arabicLabel": "الشمع وإزالة الشعر",
    "label": "Waxing & Threading",
    "id": "waxing"
  },
  {
    "label": "Glamour Makeup",
    "id": "makeup",
    "arabicLabel": "المكياج والسهرات"
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    "priceQAR": 500,
    "category": "hair",
    "arabicPrice": "٥٠٠ ر.ق",
    "title": "Hairstyle + Makeup",
    "priceDisplay": "500",
    "description": "Full professional hair styling paired with glamour makeup for special occasions.",
    "arabicTitle": "تسريحة شعر + مكياج",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562637/ukpbxsmkwk11am2tokt1.jpg",
    "arabicDescription": "باقة تسريحة شعر متكاملة ومميزة مع مكياج سهرة فاخر للمناسبات.",
    "isSignature": true,
    "durationMinutes": 90,
    "id": "hair-1"
  },
  {
    "arabicDescription": "تسريحة تموجات ويفي ناعمة وجذابة لجميع أطوال وأنواع الشعر.",
    "priceQAR": 150,
    "category": "hair",
    "arabicTitle": "تسريحة شعر ويفي",
    "description": "Glamorous beachy or soft structured waves tailored to your hair length.",
    "arabicPrice": "١٥٠ - ٢٥٠ ر.ق",
    "title": "Wavy Hair",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562639/gt4rdvxtkmuumpkcrx8e.jpg",
    "id": "hair-2",
    "durationMinutes": 45,
    "priceDisplay": "150 - 250"
  },
  {
    "priceDisplay": "150 - 350",
    "id": "hair-3",
    "arabicDescription": "جدائل وضفائر إفريقية أنيقة لحماية الشعر بتصاميم وأشكال جذابة.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787563389/nmmuwwu5gwlzezs17abn.jpg",
    "title": "African Braids",
    "description": "Custom African protective braiding styles with precision finishing.",
    "arabicTitle": "جدائل ضفائر إفريقية",
    "durationMinutes": 90,
    "category": "hair",
    "arabicPrice": "١٥٠ - ٣٥٠ ر.ق",
    "priceQAR": 150
  },
  {
    "id": "hair-4",
    "priceDisplay": "1000 - 2500",
    "category": "hair",
    "priceQAR": 1000,
    "isSignature": true,
    "title": "Protein Treatment",
    "arabicDescription": "معالج البروتين العضوي الفاخر لتغذية وتنعيم الشعر والقضاء على الهيشان.",
    "arabicPrice": "١٠٠٠ - ٢٥٠٠ ر.ق",
    "durationMinutes": 120,
    "arabicTitle": "علاج البروتين للشعر",
    "description": "Deep organic protein smoothing and restorative treatment for silkiness and shine.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562643/a885wxfigw82y1j38s8s.jpg"
  },
  {
    "arabicDescription": "علاج الكافيار العميق المتبوع بسشوار ملكي كلاسيكي ناعم وكثيف.",
    "category": "hair",
    "priceQAR": 350,
    "durationMinutes": 60,
    "id": "hair-5",
    "title": "Royal Blowout & Treatment",
    "arabicPrice": "٣٥٠ ر.ق",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562192/k4mokgftwqxbz1jt9ara.jpg",
    "priceDisplay": "350",
    "description": "Signature caviar deep-conditioning treatment followed by a royal blow-dry.",
    "arabicTitle": "سشوار وعلاج الكافيار الملكي"
  },
  {
    "durationMinutes": 30,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562644/knvr5nze7er2sohp9pkl.jpg",
    "title": "Hair Wash with Dry",
    "description": "Refresh hair wash using premium shampoo followed by professional blow-drying.",
    "arabicTitle": "غسيل وتجفيف الشعر",
    "arabicPrice": "٥٠ ر.ق",
    "priceDisplay": "50",
    "arabicDescription": "غسيل أنيق للشعر باستخدام شامبو وبلسم مغذي عالي الجودة مع تجفيف بسشوار احترافي.",
    "priceQAR": 50,
    "id": "hair-wash",
    "category": "hair"
  },
  {
    "description": "Professional blow-dry styling tailored for short hair to achieve volume and smooth elegance.",
    "arabicTitle": "سشوار - شعر قصير",
    "arabicPrice": "٨٠ ر.ق",
    "category": "hair",
    "priceQAR": 80,
    "arabicDescription": "سشوار احترافي للشعر القصير لإعطائه كثافة ونعومة فائقة ولمعان جذّاب.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562646/z3krhnnj5jzbf2hjiupa.jpg",
    "priceDisplay": "80",
    "id": "hair-blowdry-short",
    "durationMinutes": 30,
    "title": "Blow Dry – Short Hair"
  },
  {
    "id": "hair-blowdry-medium",
    "arabicTitle": "سشوار - شعر متوسط",
    "description": "Smooth, polished blow-dry styling crafted for medium length hair.",
    "category": "hair",
    "arabicPrice": "١٠٠ ر.ق",
    "priceQAR": 100,
    "priceDisplay": "100",
    "title": "Blow Dry – Medium Hair",
    "durationMinutes": 40,
    "arabicDescription": "تصفيف بسشوار حراري ناعم ومتقن للشعر متوسط الطول لمظهر ساحر ومكتمل.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562648/uux8yetfvqh7st4mwszh.jpg"
  },
  {
    "description": "Voluminous blow-dry session for long hair with thermal heat protection.",
    "arabicDescription": "سشوار فاخر ومكثف للشعر الطويل مع حماية حرارية متكاملة لإبراز أنوثة الشعر.",
    "arabicTitle": "سشوار - شعر طويل",
    "arabicPrice": "١٥٠ - ٢٠٠ ر.ق",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562650/moz6bsun1wfg6vvaa2v5.jpg",
    "priceDisplay": "150 - 200",
    "durationMinutes": 50,
    "title": "Blow Dry – Long Hair",
    "category": "hair",
    "id": "hair-blowdry-long",
    "priceQAR": 150
  },
  {
    "title": "Bangs Cut",
    "id": "hair-bangs-cut",
    "category": "hair",
    "priceQAR": 50,
    "durationMinutes": 20,
    "arabicDescription": "قص وتحديد الغرة الأمامية بدقة واحترافية لتأطير وملائمة ملامح الوجه بشكل ساحر.",
    "description": "Precision fringe or bangs trim designed to frame your facial features beautifully.",
    "arabicTitle": "قص غرة (قُصّة)",
    "arabicPrice": "٥٠ ر.ق",
    "priceDisplay": "50",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562652/vl1iiwqnybxcp7vyxk5o.jpg"
  },
  {
    "arabicTitle": "قص أطراف الشعر",
    "title": "Hair Trimmings",
    "description": "Trim damaged ends and maintain hair health without shortening overall length significantly.",
    "durationMinutes": 30,
    "arabicPrice": "٨٠ ر.ق",
    "priceQAR": 80,
    "category": "hair",
    "arabicDescription": "إزالة الأطراف التالفة والمتقصفة للحفاظ على صحة الشعر وقوته بدون تقصير الطول الأساسي.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562654/psdbyiioovfkzlx0trqp.jpg",
    "priceDisplay": "80",
    "id": "hair-trimmings"
  },
  {
    "id": "hair-style-cut",
    "priceDisplay": "140",
    "arabicTitle": "قصة شعر مودرن",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787563325/jlscprt7pumt3xp3shgp.jpg",
    "description": "Full trendy haircut styled by master stylists according to latest hair fashions.",
    "arabicPrice": "١٤٠ ر.ق",
    "arabicDescription": "قصة شعر عصرية ومميزة مصممة بأيدي أخصائيات الشعر لإطلالة متجددة تفيض أنوثة.",
    "durationMinutes": 45,
    "title": "Style Hair Cut",
    "category": "hair",
    "priceQAR": 140
  },
  {
    "id": "hair-ceramic-short",
    "priceDisplay": "80",
    "arabicDescription": "تسريحة فير سيراميك حريرية أو تمويج متقن للشعر القصير مفعم بالحيوية.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562657/xnyynfc0lpi6fmk9okrm.jpg",
    "durationMinutes": 35,
    "category": "hair",
    "priceQAR": 80,
    "arabicTitle": "فير سيراميك - شعر قصير",
    "description": "Sleek ceramic iron straightening or curling for short hair.",
    "title": "Hair Ceramic – Short Hair",
    "arabicPrice": "٨٠ ر.ق"
  },
  {
    "priceDisplay": "100 - 150",
    "durationMinutes": 45,
    "arabicPrice": "١٠٠ - ١٥٠ ر.ق",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562659/vpuclnde4eox87jnk1fa.jpg",
    "description": "Ultra-smooth ceramic flat iron or wavy styling for medium length hair.",
    "arabicTitle": "فير سيراميك - شعر متوسط",
    "id": "hair-ceramic-medium",
    "arabicDescription": "فير سيراميك ناعم أو كيرلي حراري للشعر متوسط الطول لمظهر جذاب ومبهر.",
    "category": "hair",
    "priceQAR": 100,
    "title": "Hair Ceramic – Medium Hair"
  },
  {
    "description": "Silky ceramic styling or deep defined waves for long hair.",
    "arabicTitle": "فير سيراميك - شعر طويل",
    "arabicDescription": "تصفيف فير سيراميك فاخر للشعر الطويل يمنحه الانسيابية واللمعان الحريري.",
    "arabicPrice": "٢٠٠ - ٢٥٠ ر.ق",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787563380/sjojb1msdgd1ckq5aesk.jpg",
    "id": "hair-ceramic-long",
    "priceDisplay": "200 - 250",
    "category": "hair",
    "priceQAR": 200,
    "durationMinutes": 60,
    "title": "Hair Ceramic – Long Hair"
  },
  {
    "arabicPrice": "٣٥٠ ر.ق",
    "category": "hair",
    "priceQAR": 350,
    "description": "Sophisticated updo or glam party hair styling for evening events.",
    "durationMinutes": 60,
    "priceDisplay": "350",
    "arabicTitle": "تسريحة شعر راقية",
    "id": "hair-style",
    "title": "Hair Style",
    "arabicDescription": "تسريحة مرفوعة أو كلاسيكية راقية لحفلات السهرة والمناسبات الخاصة.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562663/fjrcitwbdvwnrlrkomhp.jpg"
  },
  {
    "description": "Luxury engagement hair styling with hairpiece placement and crown setting.",
    "arabicTitle": "تسريحة خطوبة ملكية",
    "priceDisplay": "1500",
    "arabicPrice": "١٥٠٠ ر.ق",
    "category": "hair",
    "priceQAR": 1500,
    "isSignature": true,
    "id": "hair-engagement",
    "durationMinutes": 90,
    "arabicDescription": "تسريحة خطوبة فاخرة متكاملة تشمل تثبيت الإكسسوارات والتاج لعروس الخطوبة.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562665/wgmd8vvvpiq5vuba7cfz.jpg",
    "title": "Engagement Hair Style"
  },
  {
    "id": "hair-bridal",
    "priceQAR": 3500,
    "category": "hair",
    "isSignature": true,
    "title": "Bridal Hair Style",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562667/a1ic1i62op7uy2hbgds2.jpg",
    "durationMinutes": 120,
    "arabicDescription": "تسريحة العروس الملكية الفاخرة تشمل تركيب الوصلات والشرائح وتثبيت الطرحة الملكية.",
    "priceDisplay": "3500",
    "description": "Royal bridal hair design session including hair extension integration and veil fixing.",
    "arabicTitle": "تسريحة عروس ملكية",
    "arabicPrice": "٣٥٠٠ ر.ق"
  },
  {
    "arabicDescription": "جلسة حمام مغربي تقليدي بالصابون البلدي والأعشاب لتقشير وترطيب الجسم.",
    "durationMinutes": 60,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562669/btavxcfbgqlyp10mt0bz.jpg",
    "priceDisplay": "150",
    "description": "Authentic Moroccan black soap cleansing scrub with herbal steam infusion.",
    "arabicTitle": "حمام مغربي بالمنزل",
    "arabicPrice": "١٥٠ ر.ق",
    "id": "skin-1",
    "title": "Moroccan Bath at Home",
    "category": "skincare",
    "priceQAR": 150
  },
  {
    "arabicDescription": "جلسة دلكة سودانية معطرة ومساج مريح لتغذية وتفتيح البشرة وإرخاء العضلات.",
    "priceQAR": 150,
    "category": "skincare",
    "title": "Sudanese Massage (Dalka)",
    "priceDisplay": "150",
    "id": "skin-2",
    "durationMinutes": 60,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562671/djmsidwl6qsbttbj6jln.jpg",
    "arabicPrice": "١٥٠ ر.ق",
    "arabicTitle": "مساج ودلكة سودانية",
    "description": "Traditional Sudanese aromatic Dalka scrub and relaxing body massage."
  },
  {
    "arabicDescription": "تنظيف عميق للمسام وإزالة الشوائب مع أقنعة فيتامينات نضارة للبشرة.",
    "title": "Facial Cleansing",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562195/zmozqqks9ygwt8rwqueu.jpg",
    "id": "skin-3",
    "arabicPrice": "١٥٠ ر.ق",
    "arabicTitle": "تنظيف بشرة وفيشل عميق",
    "description": "Deep pore facial cleansing treatment with vitamin hydration masks.",
    "durationMinutes": 60,
    "priceDisplay": "150",
    "priceQAR": 150,
    "category": "skincare"
  },
  {
    "arabicDescription": "جلسة مساج استرخائي متكامل لمدة ساعة بالزيوت العطرية المهدئة للأعصاب.",
    "category": "skincare",
    "id": "skin-4",
    "priceQAR": 150,
    "title": "Massage 1 Hour",
    "arabicTitle": "جلسة مساج لمدة ساعة",
    "description": "60 minutes full body relaxation and aromatherapy stress-relief massage.",
    "priceDisplay": "150",
    "arabicPrice": "١٥٠ ر.ق",
    "durationMinutes": 60,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562672/dmozgbkvjf5qwhfnaq8t.jpg"
  },
  {
    "durationMinutes": 75,
    "arabicTitle": "بديكير + مانيكير شامل",
    "description": "Complete hands and feet cuticle care, shaping, scrub, and polish.",
    "id": "nail-1",
    "arabicPrice": "١٥٠ ر.ق",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562197/wesg43wrzirz170fbkso.jpg",
    "arabicDescription": "عناية فائقة وتنظيف لليدين والقدمين مع تقشير وترطيب وطلاء أظافر.",
    "priceDisplay": "150",
    "title": "Manicure + Pedicure",
    "category": "nails",
    "priceQAR": 150
  },
  {
    "category": "nails",
    "priceQAR": 30,
    "durationMinutes": 20,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562674/qpxl4tp4dsfz9eg7loqm.jpg",
    "title": "Fingers Henna",
    "arabicPrice": "٣٠ ر.ق",
    "arabicTitle": "نقش حناء أصابع",
    "arabicDescription": "نقش حناء ناعم وأنيق على أصابع اليد.",
    "description": "Delicate henna designs applied to fingers.",
    "id": "henna-1",
    "priceDisplay": "30"
  },
  {
    "arabicPrice": "٤٠ ر.ق",
    "description": "Custom traditional or modern henna artwork on palms.",
    "arabicTitle": "نقش حناء كف اليد",
    "title": "Palm Henna",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562676/hgwctin3et1zdopzamml.jpg",
    "arabicDescription": "نقش حناء مميز على كف اليد بتفاصيل جليلة.",
    "durationMinutes": 25,
    "priceDisplay": "40",
    "priceQAR": 40,
    "category": "nails",
    "id": "henna-2"
  },
  {
    "category": "nails",
    "priceQAR": 100,
    "priceDisplay": "100 - 150",
    "arabicPrice": "١٠٠ - ١٥٠ ر.ق",
    "id": "henna-3",
    "arabicDescription": "نقش حناء فاخر يمتد حتى نصف الذراع.",
    "description": "Intricate henna pattern extending up to the elbows.",
    "durationMinutes": 45,
    "arabicTitle": "نقش حناء نصف ذراع",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562678/nkz0s8u4ksrif3etuh6g.jpg",
    "title": "Half Arm Henna"
  },
  {
    "title": "Full Arm Henna",
    "arabicTitle": "نقش حناء ذراع كامل",
    "priceQAR": 250,
    "description": "Full arm bridal style elaborate henna motif.",
    "category": "nails",
    "arabicPrice": "٢٥٠ ر.ق",
    "arabicDescription": "نقش حناء كامل وكثيف للذراعين للمناسبات والعرائس.",
    "priceDisplay": "250",
    "durationMinutes": 60,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562681/dbbgkowfzkn6whtbb2x0.jpg",
    "id": "henna-4"
  },
  {
    "arabicPrice": "٥٠ ر.ق",
    "arabicTitle": "نقش حناء قدم",
    "arabicDescription": "نقش حناء أنيق ومتقن للأقدام.",
    "description": "Beautiful foot henna pattern.",
    "id": "henna-5",
    "title": "Foot Henna",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562682/ie9ozo63y9vrhy5vaboy.jpg",
    "priceDisplay": "50",
    "durationMinutes": 30,
    "category": "nails",
    "priceQAR": 50
  },
  {
    "id": "henna-6",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562684/zrd0ffx7tilwr9kf5fqn.jpg",
    "priceDisplay": "150",
    "title": "Half Leg Henna",
    "durationMinutes": 45,
    "priceQAR": 150,
    "category": "nails",
    "arabicPrice": "١٥٠ ر.ق",
    "arabicTitle": "نقش حناء نصف ساق",
    "description": "Half leg detailed henna design.",
    "arabicDescription": "نقش حناء ممتد حتى منتصف الساق."
  },
  {
    "category": "nails",
    "priceQAR": 500,
    "priceDisplay": "500",
    "arabicDescription": "نقش حناء كامل وفاخر للساقين للأعراس والمناسبات.",
    "durationMinutes": 90,
    "arabicTitle": "نقش حناء رجل كاملة",
    "id": "henna-7",
    "title": "Full Leg Henna",
    "description": "Full leg elaborate bridal henna styling.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562686/sicgrqgpsmzdwbzpadwo.jpg",
    "arabicPrice": "٥٠٠ ر.ق"
  },
  {
    "description": "Artistic back henna tattoo artwork.",
    "priceQAR": 40,
    "arabicTitle": "نقش حناء ظهر",
    "category": "nails",
    "priceDisplay": "40",
    "arabicPrice": "٤٠ ر.ق",
    "arabicDescription": "نقش حناء فني أنيق لأسفل أو أعلى الظهر.",
    "id": "henna-8",
    "durationMinutes": 30,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562688/nwsx8hwxv71ghdtjvmna.jpg",
    "title": "Back Henna Design"
  },
  {
    "description": "Precision eyebrow shaping with threading or wax.",
    "arabicTitle": "تحديد وتنظيف الحواجب",
    "arabicPrice": "٢٠ ر.ق",
    "id": "wax-1",
    "title": "Eyebrows Shaping",
    "durationMinutes": 15,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562689/ths1ohxjplwdndo3brli.jpg",
    "priceDisplay": "20",
    "arabicDescription": "تحديد وتنظيف احترافي للحواجب الخيط أو الشمع.",
    "priceQAR": 20,
    "category": "waxing"
  },
  {
    "id": "wax-2",
    "priceQAR": 10,
    "category": "waxing",
    "priceDisplay": "10",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562692/fht7rtjqq4oximqjxfxo.jpg",
    "title": "Upper Lip",
    "arabicPrice": "١٠ ر.ق",
    "arabicDescription": "إزالة ناعمة وسريعة لشعر الشارب بالخيط أو الشمع.",
    "durationMinutes": 10,
    "description": "Quick gentle upper lip hair removal.",
    "arabicTitle": "إزالة شعر الشفة العليا"
  },
  {
    "priceDisplay": "50",
    "id": "wax-3",
    "title": "Full Face Waxing/Threading",
    "priceQAR": 50,
    "category": "waxing",
    "durationMinutes": 30,
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562694/wod6ttnp3khsjo1ywcu4.jpg",
    "arabicTitle": "تنظيف وجه كامل بالشمع/الخيط",
    "description": "Full face hair removal treatment for smooth glowing skin.",
    "arabicDescription": "إزالة شعر الوجه كامل للنعومة والنضارة المثالية.",
    "arabicPrice": "٥٠ ر.ق"
  },
  {
    "arabicTitle": "إزالة شعر نصف ذراع",
    "description": "Lower or upper arm smooth waxing.",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562696/tlf5loy2o7l2j5dxayb0.jpg",
    "arabicDescription": "إزالة شعر نصف الذراع بالشمع الناعم.",
    "arabicPrice": "٤٠ ر.ق",
    "title": "Half Arm Waxing",
    "durationMinutes": 20,
    "priceDisplay": "40",
    "id": "wax-4",
    "priceQAR": 40,
    "category": "waxing"
  },
  {
    "arabicPrice": "٦٠ ر.ق",
    "description": "Lower or upper leg gentle waxing.",
    "arabicTitle": "إزالة شعر نصف ساق",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562699/knznqbrncpoccjt8ivp1.jpg",
    "arabicDescription": "إزالة شعر نصف الساق بالكامل بالشمع الفاخر.",
    "id": "wax-5",
    "priceDisplay": "60",
    "category": "waxing",
    "priceQAR": 60,
    "durationMinutes": 25,
    "title": "Half Leg Waxing"
  },
  {
    "durationMinutes": 40,
    "category": "waxing",
    "priceQAR": 80,
    "arabicDescription": "إزالة شعر الرجلين بالكامل بشرائح الشمع الملطفة.",
    "id": "wax-6",
    "priceDisplay": "80",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562701/h3zwngbsjj6mydfqyn5c.jpg",
    "title": "Full Leg Waxing",
    "arabicTitle": "إزالة شعر رجل كاملة",
    "description": "Complete full leg smooth waxing.",
    "arabicPrice": "٨٠ ر.ق"
  },
  {
    "priceDisplay": "30",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562704/kcikg5y6zva71obpianb.jpg",
    "description": "Underarm hair removal for soft clean skin.",
    "arabicTitle": "إزالة شعر الإبط",
    "arabicPrice": "٣٠ ر.ق",
    "category": "waxing",
    "id": "wax-7",
    "priceQAR": 30,
    "arabicDescription": "تنظيف وإزالة شعر منطقة الإبط بالشمع اللطيف.",
    "title": "Underarm Waxing",
    "durationMinutes": 15
  },
  {
    "arabicTitle": "إزالة شعر منطقة البطن",
    "description": "Smooth abdominal area waxing.",
    "id": "wax-8",
    "title": "Tummy Waxing",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562706/z5rk07ffg8lind0rvz6c.jpg",
    "arabicDescription": "إزالة شعر البطن لطيفة وناعمة للبشرة.",
    "arabicPrice": "٥٠ ر.ق",
    "priceQAR": 50,
    "category": "waxing",
    "priceDisplay": "50",
    "durationMinutes": 20
  },
  {
    "arabicDescription": "إزالة شعر منطقة الظهر بالشمع المرطب.",
    "durationMinutes": 25,
    "id": "wax-9",
    "arabicPrice": "٦٠ ر.ق",
    "priceQAR": 60,
    "category": "waxing",
    "title": "Back Waxing",
    "description": "Full back smooth hair removal.",
    "arabicTitle": "إزالة شعر الظهر",
    "priceDisplay": "60",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562707/ubdml4rmjjnexksvadvf.jpg"
  },
  {
    "durationMinutes": 90,
    "priceDisplay": "250",
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562709/r0oy8qxg7kcsywh1m2yi.jpg",
    "arabicPrice": "٢٥٠ ر.ق",
    "arabicDescription": "باقة متكاملة لإزالة شعر الجسم بالكامل لنعومة وإشراقة الحرير.",
    "arabicTitle": "باقة إزالة شعر الجسم كامل",
    "id": "wax-10",
    "title": "Full Body Waxing Package",
    "description": "Comprehensive full body smooth silk waxing package.",
    "category": "waxing",
    "priceQAR": 250
  },
  {
    "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787562199/iwut6xdmcdig7ocgxp1f.jpg",
    "title": "Qatar Gala Evening Makeup",
    "description": "Complete red-carpet evening makeup with 3D contouring and Mink luxury lashes.",
    "arabicTitle": "مكياج السهرات والمناسبات",
    "arabicPrice": "٧٥٠ ر.ق",
    "durationMinutes": 75,
    "arabicDescription": "مكياج سهرة احترافي متكامل مع نحت الوجه والرموش الفاخرة لإطلالة مميزة.",
    "id": "makeup-1",
    "priceQAR": 750,
    "category": "makeup",
    "priceDisplay": "750"
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    "id": "rev-1",
    "name": "Sheikha Al-Thani",
    "role": "VIP Client - Doha",
    "avatarColor": "bg-[#ffd9df]",
    "rating": 5,
    "comment": "صالون راقي جداً في الدوحة، الاهتمام بالتفاصيل ونظافة المكان والمعاملة الملكية جعلت تجربتي ممتازة."
  },
  {
    "id": "rev-2",
    "name": "Noura Al-Hajri",
    "role": "Verified Client",
    "avatarColor": "bg-[#f4dce4]",
    "rating": 5,
    "comment": "خدمة الفيشل والسشوار ممتازة للغاية. فريق العمل ودود واحترافي، والتطبيق سهل جداً في الحجز."
  },
  {
    "id": "rev-3",
    "name": "Sophia Martinez",
    "role": "Verified Client - Pearl Qatar",
    "avatarColor": "bg-[#e1bec4]",
    "rating": 5,
    "comment": "The best beauty sanctuary in West Bay Qatar! The 24k gold manicure is pure magic."
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    "id": "gal-1787595997406",
    "url": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787595996/unyhkquzwvipxyvryxkn.jpg",
    "title": "Glow Beauty Salon",
    "arabicTitle": "صالو غلو بيرتي",
    "span": "col-span-1 row-span-1"
  },
  {
    "id": "gal-1787595950422",
    "url": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787595930/xfz1ezxj08ldebu7cw5m.jpg",
    "title": "Excellence with Us",
    "arabicTitle": "التميز معانا",
    "span": "col-span-1 row-span-1"
  },
  {
    "id": "gal-1787595916277",
    "url": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787595896/czjxxhjx6cveae8tkni0.jpg",
    "title": "Excellent Choice",
    "arabicTitle": "احسنتي اختيارك",
    "span": "col-span-1 row-span-1"
  },
  {
    "id": "gal-1787595867706",
    "url": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787595866/w9idroobodygr2wzbkn6.jpg",
    "title": "Royal Suite",
    "arabicTitle": "الجناح الملكي",
    "span": "col-span-1 row-span-1"
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  "instagramUrl": "https://www.instagram.com/glowpretty_salon_qa",
  "workingHoursAR": "السبت - الخميس: 10:00 صباحاً - 10:00 مساءً | الجمعة: 1:00 ظهراً - 10:00 مساءً",
  "snapchatUrl": "",
  "locationAR": "GLOW PRETTY - الدوحة - مدينة خليفة - قطر",
  "workingHoursEN": "Sat - Thu: 10:00 AM - 10:00 PM | Fri: 1:00 PM - 10:00 PM",
  "phone": "+97471001878",
  "email": "info@glowpretty.site",
  "locationEN": "GLOW PRETTY Salon, Madinat Khalifa, Doha, Qatar",
  "tiktokUrl": "",
  "facebookUrl": "",
  "whatsapp": "+97471001878"
};

export const INITIAL_ABOUT_CONTENT: AboutContent = {
  "featuresEN": [
    "Premium Certified International Products",
    "Private VIP Suites for Discretion",
    "Bespoke Bridal & Event Consultations",
    "Master Stylists from Europe & Middle East"
  ],
  "storyAR": "غلو بريتي GLOW PRETTY هو العنوان الأول للجمال والرفاهية الملكية في قطر، يقع في الدوحة. صُمم خصيصاً للمرأة العصرية التي تبحث عن الكمال والتميز، حيث نجمع بين أحدث تقنيات الجمال العالمية والأصالة والضيافة القطرية الفاخرة.",
  "storyEN": "Glow Pretty is Qatar’s leading luxury beauty salon and spa sanctuary, located in Doha. Designed for the modern woman who seeks perfection, we combine world-class international hair and skincare technologies with warm Qatari hospitality.",
  "featuresAR": [
    "منتجات عالمية معتمدة وراقية جداً",
    "أجنحة VIP خاصة توفر الخصوصية التامة",
    "استشارات مخصصة للعرائس والمناسبات",
    "خبراء تجميل عالميون محترفون"
  ],
  "titleEN": "GLOW PRETTY - A Sanctuary of Sophistication",
  "titleAR": "GLOW PRETTY - ملاذ الفخامة والجمال في قطر"
};

export const INITIAL_SUPERVISORS: Supervisor[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    "id": "coup-1",
    "code": "GLOW10",
    "discountType": "percentage",
    "discountValue": 10,
    "maxUses": 50,
    "usedCount": 0,
    "isActive": true,
    "createdAt": "2026-08-21T17:41:50.257Z"
  },
  {
    "id": "coup-2",
    "code": "WELCOME50",
    "discountType": "fixed",
    "discountValue": 50,
    "maxUses": 20,
    "usedCount": 0,
    "isActive": true,
    "createdAt": "2026-08-21T17:41:50.257Z"
  }
];
