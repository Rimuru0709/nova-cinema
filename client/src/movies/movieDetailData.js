// Dữ liệu chi tiết, dàn diễn viên và đánh giá chuyên biệt cho từng phim tại NOVA Cinema

// 1. DÀN DIỄN VIÊN & ĐỘI NGŨ SẢN XUẤT CHO TỪNG PHIM (ẢNH THỰC TẾ & CHỨC DANH CHUẨN XÁC)
export const MOVIE_CAST_MAP = {
  "dune-2": [
    {
      id: "timothee",
      name: "Timothée Chalamet",
      character: "Paul Atreides",
      role: "Vai chính / Muad'Dib",
      avatar: "/cast/dune-timothee.jpg",
    },
    {
      id: "zendaya",
      name: "Zendaya",
      character: "Chani",
      role: "Chiến binh Fremen",
      avatar: "/cast/dune-zendaya.jpg",
    },
    {
      id: "austin",
      name: "Austin Butler",
      character: "Feyd-Rautha Harkonnen",
      role: "Kẻ tàn bạo",
      avatar: "/cast/dune-austin.jpg",
    },
    {
      id: "florence",
      name: "Florence Pugh",
      character: "Công chúa Irulan",
      role: "Hoàng gia Corrino",
      avatar: "/cast/dune-florence.jpg",
    },
    {
      id: "javier",
      name: "Javier Bardem",
      character: "Stilgar",
      role: "Thủ lĩnh Fremen",
      avatar: "/cast/dune-javier.jpg",
    },
    {
      id: "denis",
      name: "Denis Villeneuve",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/dune-denis.jpg",
    },
    {
      id: "hans",
      name: "Hans Zimmer",
      character: "Nhạc phim gốc",
      role: "Nhạc sĩ / Oscar Winner",
      avatar: "/cast/dune-hans.jpg",
    },
  ],

  "dune": [
    {
      id: "timothee",
      name: "Timothée Chalamet",
      character: "Paul Atreides",
      role: "Vai chính / Muad'Dib",
      avatar: "/cast/dune-timothee.jpg",
    },
    {
      id: "zendaya",
      name: "Zendaya",
      character: "Chani",
      role: "Chiến binh Fremen",
      avatar: "/cast/dune-zendaya.jpg",
    },
    {
      id: "austin",
      name: "Austin Butler",
      character: "Feyd-Rautha Harkonnen",
      role: "Kẻ tàn bạo",
      avatar: "/cast/dune-austin.jpg",
    },
    {
      id: "florence",
      name: "Florence Pugh",
      character: "Công chúa Irulan",
      role: "Hoàng gia Corrino",
      avatar: "/cast/dune-florence.jpg",
    },
    {
      id: "javier",
      name: "Javier Bardem",
      character: "Stilgar",
      role: "Thủ lĩnh Fremen",
      avatar: "/cast/dune-javier.jpg",
    },
    {
      id: "denis",
      name: "Denis Villeneuve",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/dune-denis.jpg",
    },
    {
      id: "hans",
      name: "Hans Zimmer",
      character: "Nhạc phim gốc",
      role: "Nhạc sĩ / Oscar Winner",
      avatar: "/cast/dune-hans.jpg",
    },
  ],

  "oppenheimer": [
    {
      id: "cillian",
      name: "Cillian Murphy",
      character: "J. Robert Oppenheimer",
      role: "Oscar Nam chính xuất sắc",
      avatar: "/cast/opp-cillian.jpg",
    },
    {
      id: "emily",
      name: "Emily Blunt",
      character: "Katherine 'Kitty' Oppenheimer",
      role: "Vợ Oppenheimer",
      avatar: "/cast/opp-emily.jpg",
    },
    {
      id: "matt",
      name: "Matt Damon",
      character: "Leslie Groves",
      role: "Trung tướng Dự án Manhattan",
      avatar: "/cast/opp-matt.jpg",
    },
    {
      id: "rdj",
      name: "Robert Downey Jr.",
      character: "Lewis Strauss",
      role: "Oscar Nam phụ xuất sắc",
      avatar: "/cast/opp-rdj.jpg",
    },
    {
      id: "nolan",
      name: "Christopher Nolan",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch / Oscar",
      avatar: "/cast/opp-nolan.jpg",
    },
    {
      id: "ludwig",
      name: "Ludwig Göransson",
      character: "Nhạc phim gốc",
      role: "Nhạc sĩ / Oscar Âm nhạc",
      avatar: "/cast/opp-ludwig.jpg",
    },
  ],

  "mai": [
    {
      id: "phuong-anh-dao",
      name: "Phương Anh Đào",
      character: "Mai",
      role: "Nữ chính / Cánh Diều Vàng",
      avatar: "/cast/mai-phuong-anh-dao.jpg",
    },
    {
      id: "tuan-tran",
      name: "Tuấn Trần",
      character: "Dương (Trùng Dương / Sâu)",
      role: "Nam chính xuất sắc",
      avatar: "/cast/mai-tuan-tran.jpg",
    },
    {
      id: "tran-thanh",
      name: "Trấn Thành",
      character: "Ông Hoàng / Đạo diễn",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/mai-tran-thanh.jpg",
    },
    {
      id: "hong-dao",
      name: "Hồng Đào",
      character: "Bà Đào",
      role: "Mẹ của Dương",
      avatar: "/cast/mai-hong-dao.jpg",
    },
    {
      id: "uyen-an",
      name: "Uyển Ân",
      character: "Bình Minh",
      role: "Đồng nghiệp tiệm massage",
      avatar: "/cast/mai-uyen-an.jpg",
    },
    {
      id: "viet-anh",
      name: "NSND Việt Anh",
      character: "Bố của Mai",
      role: "Nghệ sĩ Nhân dân",
      avatar: "/cast/mai-viet-anh.jpg",
    },
  ],

  "godzilla-kong": [
    {
      id: "rebecca-hall",
      name: "Rebecca Hall",
      character: "Dr. Ilene Andrews",
      role: "Nhà ngôn ngữ học Titan",
      avatar: "/cast/gk-rebecca.jpg",
    },
    {
      id: "brian-tyree",
      name: "Brian Tyree Henry",
      character: "Bernie Hayes",
      role: "Podcaster thuyết âm mưu",
      avatar: "/cast/gk-brian.jpg",
    },
    {
      id: "dan-stevens",
      name: "Dan Stevens",
      character: "Trapper",
      role: "Bác sĩ thú y Titan",
      avatar: "/cast/gk-dan.jpg",
    },
    {
      id: "adam-wingard",
      name: "Adam Wingard",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn MonsterVerse",
      avatar: "/cast/gk-adam.jpg",
    },
  ],

  "godzilla": [
    {
      id: "rebecca-hall",
      name: "Rebecca Hall",
      character: "Dr. Ilene Andrews",
      role: "Nhà ngôn ngữ học Titan",
      avatar: "/cast/gk-rebecca.jpg",
    },
    {
      id: "brian-tyree",
      name: "Brian Tyree Henry",
      character: "Bernie Hayes",
      role: "Podcaster thuyết âm mưu",
      avatar: "/cast/gk-brian.jpg",
    },
    {
      id: "dan-stevens",
      name: "Dan Stevens",
      character: "Trapper",
      role: "Bác sĩ thú y Titan",
      avatar: "/cast/gk-dan.jpg",
    },
    {
      id: "adam-wingard",
      name: "Adam Wingard",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn MonsterVerse",
      avatar: "/cast/gk-adam.jpg",
    },
  ],

  "deadpool-wolverine": [
    {
      id: "ryan-reynolds",
      name: "Ryan Reynolds",
      character: "Wade Wilson / Deadpool",
      role: "Vai chính & Biên kịch",
      avatar: "/cast/dp-ryan.jpg",
    },
    {
      id: "hugh-jackman",
      name: "Hugh Jackman",
      character: "Logan / Wolverine",
      role: "Huyền thoại Mutant",
      avatar: "/cast/dp-hugh.jpg",
    },
    {
      id: "emma-corrin",
      name: "Emma Corrin",
      character: "Cassandra Nova",
      role: "Phản diện Trống rỗng",
      avatar: "/cast/dp-emma.jpg",
    },
    {
      id: "matthew-macfadyen",
      name: "Matthew Macfadyen",
      character: "Mr. Paradox",
      role: "Đặc vụ TVA",
      avatar: "/cast/dp-matthew.jpg",
    },
    {
      id: "morena-baccarin",
      name: "Morena Baccarin",
      character: "Vanessa Carlysle",
      role: "Bạn gái Wade",
      avatar: "/cast/dp-morena.jpg",
    },
    {
      id: "shawn-levy",
      name: "Shawn Levy",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Nhà sản xuất",
      avatar: "/cast/dp-shawn.jpg",
    },
  ],

  "deadpool": [
    {
      id: "ryan-reynolds",
      name: "Ryan Reynolds",
      character: "Wade Wilson / Deadpool",
      role: "Vai chính & Biên kịch",
      avatar: "/cast/dp-ryan.jpg",
    },
    {
      id: "hugh-jackman",
      name: "Hugh Jackman",
      character: "Logan / Wolverine",
      role: "Huyền thoại Mutant",
      avatar: "/cast/dp-hugh.jpg",
    },
    {
      id: "emma-corrin",
      name: "Emma Corrin",
      character: "Cassandra Nova",
      role: "Phản diện Trống rỗng",
      avatar: "/cast/dp-emma.jpg",
    },
    {
      id: "shawn-levy",
      name: "Shawn Levy",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Nhà sản xuất",
      avatar: "/cast/dp-shawn.jpg",
    },
  ],

  "inside-out-2": [
    {
      id: "amy-poehler",
      name: "Amy Poehler",
      character: "Joy (Niềm Vui)",
      role: "Cảm xúc cốt lõi",
      avatar: "/cast/io-amy.jpg",
    },
    {
      id: "maya-hawke",
      name: "Maya Hawke",
      character: "Anxiety (Lo Âu)",
      role: "Cảm xúc tuổi dậy thì",
      avatar: "/cast/io-maya.jpg",
    },
    {
      id: "phyllis-smith",
      name: "Phyllis Smith",
      character: "Sadness (Buồn Bã)",
      role: "Cảm xúc thấu cảm",
      avatar: "/cast/io-phyllis.jpg",
    },
    {
      id: "ayo-edebiri",
      name: "Ayo Edebiri",
      character: "Envy (Ganh Tị)",
      role: "Cảm xúc mới",
      avatar: "/cast/io-ayo.jpg",
    },
    {
      id: "kelsey-mann",
      name: "Kelsey Mann",
      character: "Chỉ đạo hoạt hình",
      role: "Đạo diễn Pixar",
      avatar: "/cast/io-kelsey.jpg",
    },
  ],

  "lat-mat-7": [
    {
      id: "thanh-hien",
      name: "Nghệ sĩ Thanh Hiền",
      character: "Bà Hai (73 tuổi)",
      role: "Người mẹ nhân từ",
      avatar: "/cast/mai-viet-anh.jpg",
    },
    {
      id: "dinh-y-nhung",
      name: "Đinh Y Nhung",
      character: "Ba Hạnh",
      role: "Con gái thứ hai tần tảo",
      avatar: "/cast/latmat-dinh-y-nhung.png",
    },
    {
      id: "ly-hai",
      name: "Lý Hải",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/latmat-ly-hai.jpg",
    },
  ],

  "exhuma": [
    {
      id: "choi-min-sik",
      name: "Choi Min-sik",
      character: "Kim Sang-deok",
      role: "Thầy phong thủy lão làng",
      avatar: "/cast/ex-choi.jpg",
    },
    {
      id: "kim-go-eun",
      name: "Kim Go-eun",
      character: "Lee Hwa-rim",
      role: "Nữ pháp sư trừ tà",
      avatar: "/cast/ex-kim.jpg",
    },
    {
      id: "lee-do-hyun",
      name: "Lee Do-hyun",
      character: "Yoon Bong-gil",
      role: "Pháp sư trẻ",
      avatar: "/cast/ex-lee.jpg",
    },
    {
      id: "yoo-hae-jin",
      name: "Yoo Hae-jin",
      character: "Go Young-geun",
      role: "Chuyên gia mai táng",
      avatar: "/cast/ex-yoo.jpg",
    },
  ],

  "furiosa": [
    {
      id: "anya-taylor-joy",
      name: "Anya Taylor-Joy",
      character: "Imperator Furiosa",
      role: "Vai chính sa mạc",
      avatar: "/cast/fur-anya.jpg",
    },
    {
      id: "chris-hemsworth",
      name: "Chris Hemsworth",
      character: "Chúa tể Dementus",
      role: "Thủ lĩnh Biker Horde",
      avatar: "/cast/fur-chris.jpg",
    },
    {
      id: "george-miller",
      name: "George Miller",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Cha đẻ Mad Max",
      avatar: "/cast/fur-george.jpg",
    },
  ],

  "kung-fu-panda-4": [
    {
      id: "jack-black",
      name: "Jack Black",
      character: "Po",
      role: "Thần Long Đại Hiệp",
      avatar: "/cast/kfp-jack.jpg",
    },
    {
      id: "awkwafina",
      name: "Awkwafina",
      character: "Zhen",
      role: "Cáo trộm cắp thông minh",
      avatar: "/cast/kfp-awkwafina.jpg",
    },
    {
      id: "viola-davis",
      name: "Viola Davis",
      character: "The Chameleon",
      role: "Tắc Kè Biến Hình",
      avatar: "/cast/kfp-viola.jpg",
    },
    {
      id: "dustin-hoffman",
      name: "Dustin Hoffman",
      character: "Sư phụ Shifu",
      role: "Bậc thầy Kung Fu",
      avatar: "/cast/kfp-dustin.jpg",
    },
  ],

  "quiet-place": [
    {
      id: "lupita-nyongo",
      name: "Lupita Nyong'o",
      character: "Samira (Sam)",
      role: "Người sống sót New York",
      avatar: "/cast/qp-lupita.jpg",
    },
    {
      id: "joseph-quinn",
      name: "Joseph Quinn",
      character: "Eric",
      role: "Sinh viên luật người Anh",
      avatar: "/cast/qp-joseph.jpg",
    },
  ],

  "despicable-me-4": [
    {
      id: "steve-carell",
      name: "Steve Carell",
      character: "Gru",
      role: "Siêu trộm giải nghệ",
      avatar: "/cast/dm-steve.jpg",
    },
    {
      id: "kristen-wiig",
      name: "Kristen Wiig",
      character: "Lucy Wilde",
      role: "Đặc vụ AVL / Vợ Gru",
      avatar: "/cast/dm-kristen.jpg",
    },
    {
      id: "will-ferrell",
      name: "Will Ferrell",
      character: "Maxime Le Mal",
      role: "Kẻ thù nguy hiểm",
      avatar: "/cast/dm-will.jpg",
    },
  ],

  "joker-2": [
    {
      id: "joaquin-phoenix",
      name: "Joaquin Phoenix",
      character: "Arthur Fleck / Joker",
      role: "Oscar Nam chính / Hoàng tử Tội phạm",
      avatar: "/cast/jk-joaquin.jpg",
    },
    {
      id: "lady-gaga",
      name: "Lady Gaga",
      character: "Harleen Quinzel / Harley Quinn",
      role: "Bạn đồng hành điên loạn",
      avatar: "/cast/jk-gaga.jpg",
    },
    {
      id: "todd-phillips",
      name: "Todd Phillips",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/jk-todd.jpg",
    },
  ],

  "joker": [
    {
      id: "joaquin-phoenix",
      name: "Joaquin Phoenix",
      character: "Arthur Fleck / Joker",
      role: "Oscar Nam chính / Hoàng tử Tội phạm",
      avatar: "/cast/jk-joaquin.jpg",
    },
    {
      id: "lady-gaga",
      name: "Lady Gaga",
      character: "Harleen Quinzel / Harley Quinn",
      role: "Bạn đồng hành điên loạn",
      avatar: "/cast/jk-gaga.jpg",
    },
    {
      id: "todd-phillips",
      name: "Todd Phillips",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/jk-todd.jpg",
    },
  ],

  "gladiator-2": [
    {
      id: "paul-mescal",
      name: "Paul Mescal",
      character: "Lucius Verus",
      role: "Đấu sĩ La Mã huyền thoại",
      avatar: "/cast/gl-paul.jpg",
    },
    {
      id: "pedro-pascal",
      name: "Pedro Pascal",
      character: "Marcus Acacius",
      role: "Đại tướng La Mã",
      avatar: "/cast/gl-pedro.jpg",
    },
    {
      id: "denzel-washington",
      name: "Denzel Washington",
      character: "Macrinus",
      role: "Oscar Winner / Lãnh chúa mưu mô",
      avatar: "/cast/gl-denzel.jpg",
    },
    {
      id: "ridley-scott",
      name: "Ridley Scott",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn Sử thi huyền thoại",
      avatar: "/cast/gl-ridley.jpg",
    },
  ],

  "gladiator": [
    {
      id: "paul-mescal",
      name: "Paul Mescal",
      character: "Lucius Verus",
      role: "Đấu sĩ La Mã huyền thoại",
      avatar: "/cast/gl-paul.jpg",
    },
    {
      id: "pedro-pascal",
      name: "Pedro Pascal",
      character: "Marcus Acacius",
      role: "Đại tướng La Mã",
      avatar: "/cast/gl-pedro.jpg",
    },
    {
      id: "denzel-washington",
      name: "Denzel Washington",
      character: "Macrinus",
      role: "Oscar Winner / Lãnh chúa mưu mô",
      avatar: "/cast/gl-denzel.jpg",
    },
    {
      id: "ridley-scott",
      name: "Ridley Scott",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn Sử thi huyền thoại",
      avatar: "/cast/gl-ridley.jpg",
    },
  ],
};

// 2. DỮ LIỆU ĐÁNH GIÁ ĐẶC TRƯNG CHO TỪNG PHIM
export const MOVIE_REVIEWS_MAP = {
  "dune-2": [
    {
      id: "rev-dune-1",
      author: "Minh Triết, CFA",
      tier: "GOLD TIER",
      hallSeen: "Đã xem IMAX Laser",
      score: "10/10",
      content: "Âm thanh rung chuyển lồng ngực đúng nghĩa đen! Phân cảnh Paul cưỡi giun cát khổng lồ với dàn nhạc của Hans Zimmer tại phòng IMAX Grand Landmark 81 là trải nghiệm điện ảnh đỉnh cao nhất 10 năm trở lại đây. Cực kỳ đáng đồng tiền!",
      time: "Hôm qua, 21:15",
      likes: 142,
      avatar: "/cast/dune-denis.jpg",
    },
    {
      id: "rev-dune-2",
      author: "Lê Thuỳ Trang",
      tier: "NHÀ PHÊ BÌNH PHIM",
      hallSeen: "NOVA Critic Club",
      score: "9.5/10",
      content: "Denis Villeneuve đã thiết lập chuẩn mực hình ảnh mới cho thể loại Sci-Fi. Ánh sáng, màu sắc sa mạc và độ sắc nét trên màn laser tại NOVA thực sự tái hiện trọn vẹn ý đồ của đạo diễn. Austin Butler trong vai Feyd-Rautha quá xuất thần!",
      time: "25/10/2024",
      likes: 89,
      avatar: "/cast/dune-florence.jpg",
    },
  ],

  "oppenheimer": [
    {
      id: "rev-opp-1",
      author: "Hoàng Bách, Cinephile",
      tier: "PLATINUM VIP",
      hallSeen: "Đã xem: IMAX 70mm GT",
      score: "10/10",
      content: "Khoảnh khắc vụ nổ Trinity trong phòng chiếu IMAX 70mm làm cả khán phòng nín thở hoàn toàn... Sự im lặng chết chóc trước khi tiếng sóng xung kích rền vang đập rung cả ghế là trải nghiệm điện ảnh có một không hai trong đời!",
      time: "Hôm qua",
      likes: 215,
      avatar: "/cast/opp-cillian.jpg",
    },
    {
      id: "rev-opp-2",
      author: "Trần Quốc Tuấn",
      tier: "GOLD TIER",
      hallSeen: "Đã xem: Dolby Atmos",
      score: "9.7/10",
      content: "Cillian Murphy xứng đáng với tượng vàng Oscar! Diễn xuất nội tâm đỉnh cao qua từng ánh mắt dằn vặt. Phần âm nhạc dồn dập của Ludwig Göransson làm tim đập thình thịch suốt 3 tiếng không thấy mệt.",
      time: "3 ngày trước",
      likes: 124,
      avatar: "/cast/opp-nolan.jpg",
    },
  ],

  "mai": [
    {
      id: "rev-mai-1",
      author: "Ngọc Ánh, Gold Member",
      tier: "GOLD TIER",
      hallSeen: "Đã xem: VIP Gold Lounge",
      score: "9.6 / 10",
      content: "Xem phim mà khóc ướt cả khăn giấy. Phương Anh Đào diễn quá xuất thần, từng cử chỉ ánh mắt của nhân vật Mai chạm thẳng vào tim người xem. Ngồi phòng VIP Gold Lounge ghế da êm ái vừa xem vừa nhâm nhi trà rất tuyệt vời.",
      time: "2 ngày trước",
      likes: 188,
    },
    {
      id: "rev-mai-2",
      author: "Đỗ Hoàng Nam",
      tier: "THÀNH VIÊN NOVA",
      hallSeen: "Đã xem: Hall 01",
      score: "9.2 / 10",
      content: "Phim chỉn chu vượt bậc của Trấn Thành từ góc máy, màu sắc điện ảnh đến chiều sâu tâm lý xã hội. Âm nhạc của Phan Mạnh Quỳnh cất lên là nổi da gà.",
      time: "5 ngày trước",
      likes: 93,
    },
  ],

  "godzilla-kong": [
    {
      id: "rev-gk-1",
      author: "Vũ Minh Quân",
      tier: "GOLD TIER",
      hallSeen: "Đã xem: ScreenX 270°",
      score: "9.0 / 10",
      content: "Các pha combat long trời lở đất giữa Godzilla và Kong ở Trái Đất Rỗng xem trên màn ScreenX 270 độ đã mắt cực kỳ! Âm thanh đấm đá rung cả lồng ngực.",
      time: "1 ngày trước",
      likes: 76,
    },
    {
      id: "rev-gk-2",
      author: "Bảo Trâm",
      tier: "THÀNH VIÊN NOVA",
      hallSeen: "Đã xem: IMAX Laser",
      score: "8.8 / 10",
      content: "Phim thuần giải trí đỉnh cao! Kỹ xảo CGI mượt mà, Kong có nhiều phân cảnh biểu cảm rất tình cảm. Rất đáng tiền vé cuối tuần cùng bạn bè.",
      time: "4 ngày trước",
      likes: 54,
    },
  ],

  "deadpool-wolverine": [
    {
      id: "rev-dp-1",
      author: "Thành Long, Marvel Fan",
      tier: "PLATINUM VIP",
      hallSeen: "Đã xem: IMAX Laser",
      score: "9.8 / 10",
      content: "Màn kết hợp trong mơ giữa Ryan Reynolds và Hugh Jackman! Đầy ắp các cảnh hành động chuẩn R-rated và vô số cameo bất ngờ làm cả rạp hú hét không ngừng.",
      time: "Vừa xong",
      likes: 167,
    },
    {
      id: "rev-dp-2",
      author: "Yến Nhi",
      tier: "GOLD TIER",
      hallSeen: "Đã xem: Dolby Atmos",
      score: "9.5 / 10",
      content: "Cười đau cả bụng với các miếng hài châm biếm MCU. Xem ở phòng Dolby Atmos nghe các bài nhạc rock hoài niệm cực kỳ phấn khích!",
      time: "2 ngày trước",
      likes: 112,
    },
  ],

  "inside-out-2": [
    {
      id: "rev-io-1",
      author: "Thu Thảo, Tâm lý học",
      tier: "GOLD TIER",
      hallSeen: "Đã xem: VIP Lounge",
      score: "9.7 / 10",
      content: "Nhân vật Anxiety (Lo Âu) như soi chiếu chính tâm lý của người trẻ hiện đại. Đoạn cao trào xúc động rơi nước mắt. Một tác phẩm hoạt hình sâu sắc cho cả người lớn!",
      time: "Hôm qua",
      likes: 204,
    },
    {
      id: "rev-io-2",
      author: "Quang Huy",
      tier: "THÀNH VIÊN NOVA",
      hallSeen: "Đã xem: Hall 02",
      score: "9.4 / 10",
      content: "Pixar đã trở lại với phong độ đỉnh cao nhất. Màu sắc rực rỡ, thông điệp về sự chấp nhận mọi cảm xúc của bản thân rất nhân văn.",
      time: "3 ngày trước",
      likes: 85,
    },
  ],

  "lat-mat-7": [
    {
      id: "rev-lm-1",
      author: "Bác Hùng, TP.HCM",
      tier: "GOLD TIER",
      hallSeen: "Đã xem: VIP Gold Lounge",
      score: "9.6 / 10",
      content: "Phim của Lý Hải kỳ này quá cảm động. Hình ảnh người mẹ già một mình ngóng các con về làm tôi nhớ mẹ ở quê chảy nước mắt. Cả rạp sụt sùi từ nửa sau phim.",
      time: "1 ngày trước",
      likes: 145,
    },
    {
      id: "rev-lm-2",
      author: "Thanh Trúc",
      tier: "THÀNH VIÊN NOVA",
      hallSeen: "Đã xem: Hall 03",
      score: "9.2 / 10",
      content: "Câu chuyện gần gũi với mọi gia đình Việt Nam. Bối cảnh Lạc Dương, Lâm Đồng lên phim đẹp và thơ mộng vô cùng. Diễn xuất của bà Hai chạm tới đáy lòng.",
      time: "4 ngày trước",
      likes: 79,
    },
  ],
};

// 3. ĐIỂM SỐ IMDB VÀ THỐNG KÊ REVIEW RIÊNG CHO TỪNG PHIM
export const MOVIE_RATING_METAS = {
  "dune-2": {
    imdb: "8.6",
    imdbSub: "Top 250",
    novaScore: "9.6",
    totalReviews: "4.200",
    fiveStars: 90,
    fourStars: 7,
    threeStars: 2,
    twoStars: 1,
    oneStars: 0,
    quote: "“98% khán giả đã xem tại rạp ngợi khen hình ảnh choáng ngợp, điểm nhấn âm thanh IMAX Laser...”",
  },
  "dune": {
    imdb: "8.6",
    imdbSub: "Top 250",
    novaScore: "9.6",
    totalReviews: "4.200",
    fiveStars: 90,
    fourStars: 7,
    threeStars: 2,
    twoStars: 1,
    oneStars: 0,
    quote: "“98% khán giả đã xem tại rạp ngợi khen hình ảnh choáng ngợp, điểm nhấn âm thanh IMAX Laser...”",
  },
  "oppenheimer": {
    imdb: "8.9",
    imdbSub: "Top 250 • 7 Oscar",
    novaScore: "9.4",
    totalReviews: "8.900",
    fiveStars: 88,
    fourStars: 9,
    threeStars: 2,
    twoStars: 1,
    oneStars: 0,
    quote: "“99% khán giả khẳng định đây là kiệt tác điện ảnh xuất sắc nhất thập kỷ của Christopher Nolan...”",
  },
  "mai": {
    imdb: "7.2",
    imdbSub: "Kỷ lục 520 Tỷ",
    novaScore: "9.1",
    totalReviews: "12.000",
    fiveStars: 82,
    fourStars: 13,
    threeStars: 3,
    twoStars: 2,
    oneStars: 0,
    quote: "“96% khán giả đánh giá cao diễn xuất chân thực và chiều sâu tâm lý xã hội đầy xúc động...”",
  },
  "godzilla-kong": {
    imdb: "6.5",
    imdbSub: "MonsterVerse",
    novaScore: "8.9",
    totalReviews: "3.100",
    fiveStars: 78,
    fourStars: 16,
    threeStars: 4,
    twoStars: 2,
    oneStars: 0,
    quote: "“92% người xem hài lòng với các pha đại chiến Titan mãn nhãn trên màn ScreenX 270°...”",
  },
  "godzilla": {
    imdb: "6.5",
    imdbSub: "MonsterVerse",
    novaScore: "8.9",
    totalReviews: "3.100",
    fiveStars: 78,
    fourStars: 16,
    threeStars: 4,
    twoStars: 2,
    oneStars: 0,
    quote: "“92% người xem hài lòng với các pha đại chiến Titan mãn nhãn trên màn ScreenX 270°...”",
  },
  "deadpool-wolverine": {
    imdb: "7.8",
    imdbSub: "Top 1 Phim R 2024",
    novaScore: "9.2",
    totalReviews: "18.500",
    fiveStars: 84,
    fourStars: 12,
    threeStars: 3,
    twoStars: 1,
    oneStars: 0,
    quote: "“98% khán giả bùng nổ cảm xúc với chemistry đỉnh cao giữa Ryan Reynolds và Hugh Jackman...”",
  },
  "deadpool": {
    imdb: "7.8",
    imdbSub: "Top 1 Phim R 2024",
    novaScore: "9.2",
    totalReviews: "18.500",
    fiveStars: 84,
    fourStars: 12,
    threeStars: 3,
    twoStars: 1,
    oneStars: 0,
    quote: "“98% khán giả bùng nổ cảm xúc với chemistry đỉnh cao giữa Ryan Reynolds và Hugh Jackman...”",
  },
  "inside-out-2": {
    imdb: "7.7",
    imdbSub: "Top 1 Box Office 2024",
    novaScore: "9.0",
    totalReviews: "14.200",
    fiveStars: 81,
    fourStars: 14,
    threeStars: 3,
    twoStars: 2,
    oneStars: 0,
    quote: "“97% người xem khẳng định phim chạm đến sâu thẳm tâm lý thanh thiếu niên và người trưởng thành...”",
  },
  "lat-mat-7": {
    imdb: "7.6",
    imdbSub: "Top 2 Box Office VN",
    novaScore: "9.2",
    totalReviews: "15.400",
    fiveStars: 83,
    fourStars: 13,
    threeStars: 3,
    twoStars: 1,
    oneStars: 0,
    quote: "“95% người xem rơi nước mắt với thông điệp tình mẫu tử thiêng liêng và lòng hiếu thảo...”",
  },
  "furiosa": {
    imdb: "7.6",
    imdbSub: "Mad Max Saga",
    novaScore: "8.9",
    totalReviews: "3.600",
    fiveStars: 78,
    fourStars: 15,
    threeStars: 5,
    twoStars: 2,
    oneStars: 0,
    quote: "“94% khán giả tán dương các phân cảnh rượt đuổi nghẹt thở và diễn xuất lăn xả của Anya Taylor-Joy...”",
  },
  "exhuma": {
    imdb: "7.0",
    imdbSub: "Hiện Tượng Châu Á",
    novaScore: "9.1",
    totalReviews: "9.500",
    fiveStars: 82,
    fourStars: 13,
    threeStars: 3,
    twoStars: 2,
    oneStars: 0,
    quote: "“96% người xem bị lôi cuốn bởi yếu tố tâm linh phong thủy ma mị và không khí căng thẳng cực độ...”",
  },
  "kung-fu-panda-4": {
    imdb: "6.7",
    imdbSub: "DreamWorks Animation",
    novaScore: "8.4",
    totalReviews: "2.800",
    fiveStars: 70,
    fourStars: 20,
    threeStars: 6,
    twoStars: 3,
    oneStars: 1,
    quote: "“91% khán giả gia đình thích thú với những màn võ thuật hài hước của gấu Po và âm nhạc rộn rã...”",
  },
  "quiet-place": {
    imdb: "6.4",
    imdbSub: "Căng Thẳng Tột Độ",
    novaScore: "8.3",
    totalReviews: "2.100",
    fiveStars: 68,
    fourStars: 22,
    threeStars: 6,
    twoStars: 3,
    oneStars: 1,
    quote: "“89% người xem ấn tượng với thiết kế âm thanh Atmos và diễn xuất xuất sắc của Lupita Nyong'o...”",
  },
};

// BẢNG TRA CỨU YOUTUBE TRAILER ID CHÍNH THỨC CHO TỪNG PHIM TẠI NOVA CINEMA
export const MOVIE_TRAILERS_MAP = {
  "mai": "EX6clvId19s",
  "dune-2": "Way9Dexny3w",
  "dune": "Way9Dexny3w",
  "oppenheimer": "uYPbbksJxIg",
  "godzilla-kong": "qqrpMRDuPfc",
  "godzilla": "qqrpMRDuPfc",
  "deadpool-wolverine": "73_1biulkYk",
  "deadpool": "73_1biulkYk",
  "inside-out-2": "LEjhY15eCx0",
  "furiosa": "XJMuhwVlca4",
  "exhuma": "sO3Rj4L3D3o",
  "kung-fu-panda-4": "_inKs4eeHiI",
  "quiet-place": "YPY7J-flzE8",
  "lat-mat-7": "oU84eBwH3l0",
  "despicable-me-4": "qQlr9-rF32A",
  "avatar-3": "d9MyW72ELq0",
  "joker-2": "_OKAwz2NiJs",
  "joker": "_OKAwz2NiJs",
  "gladiator-2": "4rgYUipGJNo",
  "gladiator": "4rgYUipGJNo",
  "wicked": "6COmYeLsz4c",
  "mission-impossible-8": "NOhDyHN4-T8",
  "spider-verse-3": "cqGjhVJWtEg",
  "alien-romulus": "x0XDEhP4MQs",
  "captain-america-4": "1pHDWnXmK7Y",
};

// Hàm trích xuất YouTube Video ID từ URL hoặc movie object/id
export function getYoutubeId(urlOrMovie, fallbackId = "") {
  if (!urlOrMovie && !fallbackId) return "Way9Dexny3w";

  // Nếu tham số là một object movie
  if (typeof urlOrMovie === "object" && urlOrMovie !== null) {
    const id = urlOrMovie.id || fallbackId || "";
    const title = urlOrMovie.title || "";
    const url = urlOrMovie.trailerUrl;

    if (url && typeof url === "string") {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) return match[1];
    }

    if (id && MOVIE_TRAILERS_MAP[id]) return MOVIE_TRAILERS_MAP[id];
    if (id.toLowerCase().includes("mai") || title.toLowerCase().includes("mai")) return "EX6clvId19s";
    if (id.toLowerCase().includes("dune")) return "Way9Dexny3w";
    if (id.toLowerCase().includes("oppenheimer")) return "uYPbbksJxIg";
    if (id.toLowerCase().includes("godzilla")) return "qqrpMRDuPfc";
    return MOVIE_TRAILERS_MAP[id] || "Way9Dexny3w";
  }

  // Nếu tham số là một URL string
  if (typeof urlOrMovie === "string") {
    const match = urlOrMovie.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) return match[1];
  }

  // Nếu có fallbackId (ví dụ movie.id)
  if (fallbackId && MOVIE_TRAILERS_MAP[fallbackId]) {
    return MOVIE_TRAILERS_MAP[fallbackId];
  }
  if (fallbackId && fallbackId.toLowerCase().includes("mai")) {
    return "EX6clvId19s";
  }

  return "Way9Dexny3w";
}

// Hàm lấy danh sách diễn viên cho phim bất kỳ
export function getCastForMovie(movie) {
  if (!movie) return MOVIE_CAST_MAP["dune-2"];
  const id = movie.id || "";
  if (MOVIE_CAST_MAP[id]) return MOVIE_CAST_MAP[id];
  if (id === "dune" && MOVIE_CAST_MAP["dune-2"]) return MOVIE_CAST_MAP["dune-2"];
  if (id === "godzilla" && MOVIE_CAST_MAP["godzilla-kong"]) return MOVIE_CAST_MAP["godzilla-kong"];
  if (id === "deadpool" && MOVIE_CAST_MAP["deadpool-wolverine"]) return MOVIE_CAST_MAP["deadpool-wolverine"];
  if (id === "joker" && MOVIE_CAST_MAP["joker-2"]) return MOVIE_CAST_MAP["joker-2"];
  if (id === "gladiator" && MOVIE_CAST_MAP["gladiator-2"]) return MOVIE_CAST_MAP["gladiator-2"];

  // Kiểm tra theo tiêu đề phim
  const title = (movie.title || "").toLowerCase();
  if (title.includes("mai")) return MOVIE_CAST_MAP["mai"];
  if (title.includes("dune")) return MOVIE_CAST_MAP["dune-2"];
  if (title.includes("oppenheimer")) return MOVIE_CAST_MAP["oppenheimer"];
  if (title.includes("godzilla") || title.includes("kong")) return MOVIE_CAST_MAP["godzilla-kong"];
  if (title.includes("deadpool") || title.includes("wolverine")) return MOVIE_CAST_MAP["deadpool-wolverine"];
  if (title.includes("lật mặt") || title.includes("lat mat")) return MOVIE_CAST_MAP["lat-mat-7"];
  if (title.includes("quật mộ") || title.includes("exhuma")) return MOVIE_CAST_MAP["exhuma"];
  if (title.includes("furiosa") || title.includes("mad max")) return MOVIE_CAST_MAP["furiosa"];
  if (title.includes("kung fu panda") || title.includes("gấu trúc")) return MOVIE_CAST_MAP["kung-fu-panda-4"];
  if (title.includes("inside out") || title.includes("những mảnh ghép")) return MOVIE_CAST_MAP["inside-out-2"];
  if (title.includes("câm lặng") || title.includes("quiet place")) return MOVIE_CAST_MAP["quiet-place"];
  if (title.includes("trộm mặt trăng") || title.includes("despicable")) return MOVIE_CAST_MAP["despicable-me-4"];
  if (title.includes("joker")) return MOVIE_CAST_MAP["joker-2"];
  if (title.includes("giác đấu") || title.includes("gladiator")) return MOVIE_CAST_MAP["gladiator-2"];

  // Nếu là phim khác, dùng dàn diễn viên chất lượng cao có avatar thực tế
  return [
    {
      id: `${movie.id}-dir`,
      name: movie.director || "Christopher Nolan",
      character: "Chỉ đạo sản xuất",
      role: "Đạo diễn & Biên kịch",
      avatar: "/cast/opp-nolan.jpg",
    },
    {
      id: `${movie.id}-lead1`,
      name: "Timothée Chalamet",
      character: "Nhân vật trung tâm",
      role: "Vai chính xuất sắc",
      avatar: "/cast/dune-timothee.jpg",
    },
    {
      id: `${movie.id}-lead2`,
      name: "Zendaya",
      character: "Nữ anh hùng đồng hành",
      role: "Tuyến chính",
      avatar: "/cast/dune-zendaya.jpg",
    },
    {
      id: `${movie.id}-music`,
      name: "Hans Zimmer",
      character: "Âm nhạc & Sound Design",
      role: "Nhạc phim gốc",
      avatar: "/cast/dune-hans.jpg",
    },
  ];
}

// Lấy danh sách nhận xét cho phim
export function getReviewsForMovie(movie) {
  if (!movie) return MOVIE_REVIEWS_MAP["dune-2"];
  const id = movie.id || "";
  if (MOVIE_REVIEWS_MAP[id]) return MOVIE_REVIEWS_MAP[id];
  if (id === "dune" && MOVIE_REVIEWS_MAP["dune-2"]) return MOVIE_REVIEWS_MAP["dune-2"];
  if (id === "godzilla" && MOVIE_REVIEWS_MAP["godzilla-kong"]) return MOVIE_REVIEWS_MAP["godzilla-kong"];
  if (id === "deadpool" && MOVIE_REVIEWS_MAP["deadpool-wolverine"]) return MOVIE_REVIEWS_MAP["deadpool-wolverine"];

  // Tự động sinh nhận xét tích cực phù hợp với phim
  return [
    {
      id: `rev-${movie.id}-1`,
      author: "Nguyễn Hải Đăng, CFA",
      tier: "GOLD TIER",
      hallSeen: `Đã xem: ${movie.format || "IMAX Laser"}`,
      score: `${movie.rating ? movie.rating.toFixed(1) : "9.5"} / 10`,
      content: `Trải nghiệm bộ phim "${movie.title}" tại rạp NOVA thực sự vượt ngoài mong đợi! Hình ảnh mãn nhãn, âm thanh sống động và diễn xuất của dàn diễn viên rất tròn vai. Rất đáng đồng tiền bát gạo!`,
      time: "Hôm qua",
      likes: 120,
    },
    {
      id: `rev-${movie.id}-2`,
      author: "Phương Linh",
      tier: "NOVA CRITIC",
      hallSeen: "Đã xem: VIP Gold Lounge",
      score: "9.2 / 10",
      content: `Đạo diễn ${movie.director || "chỉ đạo"} đã tạo nên một tác phẩm ${movie.genre ? movie.genre.toLowerCase() : "điện ảnh"} rất lôi cuốn. Không gian phòng chiếu VIP của NOVA Cinema phục vụ chu đáo, trải nghiệm xem phim hoàn hảo.`,
      time: "2 ngày trước",
      likes: 74,
    },
  ];
}

// Lấy thông số đánh giá cho phim (khớp hoàn toàn với card hiển thị)
export function getRatingMetaForMovie(movie) {
  if (!movie) return MOVIE_RATING_METAS["dune-2"];

  const id = movie.id || "";
  const meta =
    MOVIE_RATING_METAS[id] ||
    (id === "dune" ? MOVIE_RATING_METAS["dune-2"] : null) ||
    (id === "godzilla" ? MOVIE_RATING_METAS["godzilla-kong"] : null) ||
    (id === "deadpool" ? MOVIE_RATING_METAS["deadpool-wolverine"] : null) ||
    (movie.shortTitle && MOVIE_RATING_METAS[movie.shortTitle.toLowerCase()]) ||
    {};

  // ĐIỂM SỐ SAO NOVA: Luôn lấy theo movie.rating để số sao trên trang Chi tiết KHỚP 100% với số sao trên Card ở Trang chủ & Danh sách phim
  const hasMovieRating = movie.rating !== null && movie.rating !== undefined && !isNaN(Number(movie.rating));
  const scoreNum = hasMovieRating
    ? Number(movie.rating)
    : (meta.novaScore ? Number(meta.novaScore) : 9.1);
  const formattedNovaScore = scoreNum.toFixed(1);

  // SỐ LƯỢNG ĐÁNH GIÁ: Ưu tiên lấy theo movie.reviews nếu có
  const hasMovieReviews = movie.reviews !== null && movie.reviews !== undefined && !isNaN(Number(movie.reviews)) && Number(movie.reviews) > 0;
  const formattedReviews = hasMovieReviews
    ? Number(movie.reviews).toLocaleString("vi-VN")
    : (meta.totalReviews || "12.000");

  // TÍNH TOÁN % CÁC SAO ĐỒNG BỘ THEO SCORE THỰC TẾ
  const fiveStars = (meta.fiveStars && meta.novaScore === formattedNovaScore)
    ? meta.fiveStars
    : Math.min(95, Math.max(65, Math.round((scoreNum / 10) * 92)));
  const fourStars = (meta.fourStars && meta.novaScore === formattedNovaScore)
    ? meta.fourStars
    : Math.max(4, Math.round((100 - fiveStars) * 0.72));
  const threeStars = (meta.threeStars && meta.novaScore === formattedNovaScore)
    ? meta.threeStars
    : Math.max(1, Math.round((100 - fiveStars - fourStars) * 0.65));
  const twoStars = (meta.twoStars && meta.novaScore === formattedNovaScore)
    ? meta.twoStars
    : Math.max(0, 100 - fiveStars - fourStars - threeStars);
  const oneStars = 0;

  return {
    imdb: meta.imdb || (scoreNum > 0 ? (scoreNum * 0.9).toFixed(1) : "8.5"),
    imdbSub: meta.imdbSub || "Top Đánh Giá",
    novaScore: formattedNovaScore,
    totalReviews: formattedReviews,
    fiveStars,
    fourStars,
    threeStars,
    twoStars,
    oneStars,
    quote: meta.quote || `“${Math.min(99, Math.round(scoreNum * 10.4))}% khán giả đã xem tại rạp ngợi khen trải nghiệm hình ảnh và âm thanh sống động...”`,
  };
}
