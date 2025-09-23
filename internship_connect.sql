-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 18, 2025 at 09:17 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `internship_connect`
--

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `application_id` varchar(36) NOT NULL,
  `internship_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `status` enum('submitted','review','approved','rejected') DEFAULT 'submitted',
  `appliedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, 'Quest International University ', 'quest@qiu.edu.my', 'hello', '2025-09-18 18:07:45');

-- --------------------------------------------------------

--
-- Table structure for table `employers`
--

CREATE TABLE `employers` (
  `company_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `companyName` varchar(100) NOT NULL,
  `companyEmail` varchar(100) DEFAULT NULL,
  `companyPhone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `internships`
--

CREATE TABLE `internships` (
  `internship_id` varchar(36) NOT NULL,
  `company_id` varchar(36) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `status` enum('pending','open','closed') DEFAULT 'pending',
  `eligibilityCriteria` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, '70a33156-4c73-45a0-bcde-773cb98d774f', 'dad890cc16d2704d0682487c1c46878adc517351e41de737176df19b26dea49d', '2025-09-17 03:16:12', '2025-09-16 18:16:12'),
(2, '70a33156-4c73-45a0-bcde-773cb98d774f', 'f439ccbb9504d26aa0959ec6293bb82d0d96b8f8749ad4b60ca95c400061cbde', '2025-09-17 03:22:07', '2025-09-16 18:22:07');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` varchar(40) NOT NULL,
  `subscription_id` varchar(40) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('fpx') NOT NULL,
  `status` enum('completed','failed','refunded') NOT NULL,
  `paid_at` datetime NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `bank` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `subscription_id`, `amount`, `payment_method`, `status`, `paid_at`, `transaction_id`, `bank`, `account_number`) VALUES
('PAY-51f14206-372c-4558-ac91-7546e41c2d8b', 'SUB-816d6440-761f-454e-a148-30d2f97a03bc', 300.00, 'fpx', 'completed', '2025-09-16 02:28:14', 'TXN-f5bd0b64-f59d-4c41-9a70-f3fa9297785f', 'Public Bank', '123456788765');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` varchar(36) NOT NULL,
  `company_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `feedback` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resume`
--

CREATE TABLE `resume` (
  `resume_id` varchar(36) NOT NULL,
  `personalDescription` text DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `educationLevel` varchar(100) DEFAULT NULL,
  `skill` text DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `profileUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `university_id` varchar(36) NOT NULL,
  `resume_id` varchar(36) DEFAULT NULL,
  `matricNo` varchar(50) DEFAULT NULL,
  `fullName` varchar(100) NOT NULL,
  `program` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `user_id`, `university_id`, `resume_id`, `matricNo`, `fullName`, `program`, `phoneNumber`, `is_verified`) VALUES
('53172c5a-870a-44bc-9e54-d8bb9e90447b', '70a33156-4c73-45a0-bcde-773cb98d774f', 'UNI-123456', NULL, 'QIU-202304-006302', 'Yeou Torng Lau', 'Bachelor of Information Technology ', '01111155678', 0);

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `subscription_id` varchar(40) NOT NULL,
  `university_id` varchar(36) NOT NULL,
  `subscribedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `validUntil` datetime DEFAULT NULL,
  `status` enum('paid','expired','pending') DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `payment_id` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`subscription_id`, `university_id`, `subscribedAt`, `validUntil`, `status`, `amount`, `payment_id`) VALUES
('SUB-816d6440-761f-454e-a148-30d2f97a03bc', 'UNI-123456', '2025-09-15 10:27:55', '2026-09-15 18:27:55', 'paid', 300.00, 'PAY-51f14206-372c-4558-ac91-7546e41c2d8b');

-- --------------------------------------------------------

--
-- Table structure for table `system_admins`
--

CREATE TABLE `system_admins` (
  `systemAdmin_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `university_id` varchar(36) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `faculty` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `contactEmail` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `profileImage` longblob DEFAULT NULL,
  `profileImageType` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_admins`
--

INSERT INTO `system_admins` (`systemAdmin_id`, `user_id`, `university_id`, `position`, `faculty`, `phoneNumber`, `contactEmail`, `name`, `profileImage`, `profileImageType`) VALUES
('SYSADMIN-fc408dee-7b85-422a-baee-3ce', 'USER-caeef602-cf73-46ae-bd3b-9812022', 'UNI-123456', 'Internship Department', 'Career and Profesionalism', '012-21324533', 'quest@qiu.edu.my', 'Quest International University ', 0x89504e470d0a1a0a0000000d4948445200000200000001760804000000b2e2e8300000000467414d410000b18f0bfc6105000000206348524d00007a26000080840000fa00000080e8000075300000ea6000003a98000017709cba513c00001b304944415478daecd9bd4bd4011cc7713de5d42cab33c2d2211c8a9c0cc2a2221adc1a4c7ad0a0a2c1ae21c8a1109182488a8a841e286b28a8e084908283241a74a8965621921ea6280a8206c9ae87fb36073d87701eafd7fb5ff87cf9fdf8fd4a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080c214c998a502ab321296c9b488f22755634b6f769cdb7ff8c8c153fbceeebaba39d33ea4c269d3d0f6ebe9c1ee81dee3277aae758dac7f342f92516ab9fca7287b5e7fbeb5f774d79d75138bded74ea5bea4627ecc896a8fdc026b76cc8d54a4f2b5b90593cb5e6f7dd07da33f3ddc143536cc3f8af2bb6b0ef4b58dad785b952f8bd228d18c291165d1f0b1f5e9ce2b97b63caeb365fe522487571f1a6899a8ff9c704e33b89a58fe6edbc8c53de3299be68fdd6fec3bb6f645cd574ffd62a832964ceece5ede18d596cd6f45c585ceb6d1c53987534c55e657beea39f9b0d1bef9a5f185fd479bdf54389922ac2ed7712fd3ea67213f956d4a671aa6bcf8176b55b1e1d9e08e485a3a3f70bbb9335bfbc99914738968797966ef075f03f85e94de5ad53efa8dbdf30eb3aabcf6f03ed3712803cc200e368a151045b0126b50518a282a6a245e7b0d51a36003ae44d1d888512cb16043b0611412bb89c2008a80880d2302d206704018a69d39e7bd8f726f6e8aeb834fce9c39e7ecdffbfbdfe79167af77ce5e7b7deb6b11538964be02f62bbf75682c5fcfbcf8275eddebf43f17a9fc439108fb95df7d2e397aeac5fff269c9054fe9c77f981470d0e2f103342a2c7e6059e1a89bdbd5a82cc2945c8e99fd5c0f3dfb22207bec2fba95abf31fb614d55ff8f467457afe43cf6bed0796e5a92042985d37de7989a602424e346fc4ef5a47550c614c0ebd3f7cb39b6a20d4bc74d8015feab84f58d3a66ee8ed3a211062ca9b5c7a772b7dfc0b6d221cf5e5f3dd5507a1e5f9837a7dadf65f98d3b27ed8ed1b3411104ec8bbfab7c57aff0f75221c3f77da2eaa8550f25ec9a9335502614fdbca872f502d8492874feab04e0510f6348d9f33febba6aa861032f28e4235007538889e9f4cdb5fd5103a56140d9a52a00250e85c316e80ea2174bcddabeb227d01500276a8bfec0672551121e3e1419d2af4f02b01590c9e5ca7adc161e3a6733b54ebe157becf80b239a5aa885041d64523dac6f5e82bdfa7cfa7cf6816205cd064f003cdf4e82b3fa4f792fb3aaa2642052d4f9aa8e5dfcae61cbef29ebd5413a1a27efbfe53750a50d99c9e6befeda99a0815b5a57ddfd083af6c4eb775f7f7524d844d006feac15736a7dbfafb7fa69a900014094048008a042024004502101280220108094091008404a0480042025024002101281280900014094048008a0420240045021012802201881009a080f674a44312d2915dd92eb376f3e3feff6d2301885417403177323d4979972bc8cb9cfbf99cff72654ce1200940a4ba00b219c80a92c54a0692194bcd9b7327b5d854720ddb490022f57b00d9fc866a92c56cba66c48fff516cc06623d751a81e80488f26604b1e274e7288f3142d09d23a795cc53a6c6ab99de66a028af4f90ad09932924515d791ce8b4df3b998b5d8d4702fc5fa0a20d2eb33e0f12c23592c6340da76027218c2326ca23c4aa93e038a7413404e923b017b12a46122f4630936315e6027cd0188741c046ac593c4480e719ea6751a96ff312cc426c65476d3209048d749c02ecc22596c6458da75027a310f17efb18f260145fa0a20425f96932c56d28f208dd29d0f70319b1e1a0516e97d1620876154912c66b337419aa40befe0621e3fd3590091fe87815af314716c163393591e799f9558d4f3789a740276632a316cbee418221280c884d3805d9881cddb74a68d574ea31c8b6aae239720c5b3132f10c366290389e834a0c894e3c07d5981c5266ef46cde3561249bb05849ff149f0928653c516c967316393a0e2c324700390ca7068b559c42e095363c87cd2cf62248d9b4e63eaab159cb85e46b1f80c8ac8520253c4e148bf9ecebfd5a31d7793aa03865cffc8da1169bf55c45be168288ccdb08d4995958c4799612028f64712aabb0d8c4f0949c0928e43adc67fe46d35c1b814466ae043bc151b2b58c24cf73f3d0486ab05849df143cf47305ebb1a9e12e5a682598c85401e4319c8d5894732a599e6fd3938863319b2e0429945ccea7c259fe0fd24a3b0145262f052de649e258ccf55eedb11ff35d330129d40988309865d8c4789a522d051599be15784f3ec0e6394a3ccbea14566151cd707253a4fc4fe46b6ce24c66676d051661580bde8fe55854318aed3c3b01a3a8c6a29cfe042910f7993f788dddb4165c844300f95c4b1516ab3899c02bdbf3223665742668e41cca1c5cfc8d6eba174084e76290563c410c8bf9dee5b02f1f61116bf499801e94e162363d75318808d7cd409d791f8b1813d9debbc1b62a454f07ecc5dbb858c051ba194884ef6ab07eacc0a28a91e47b76026ea2168be59cd048a7033af112316cbea02f591280089f0072194625166bbd4f0714f30236b31ae5ee801d799638364b389988ee0614e1bc1cb484a7886131c7bb647b300f8b184f24fdee80621e228a4d39e791a3cb41455805e09e098831c9b31390c569acc2a28a6b92da0968c958eab0a9e057e4e9766011eeebc1fbb10c8b1a6ea2c073d47814b558ac48e2e98066dc4635361b1846beae071761174013aea70a8b72067acf044c268e455992f604e43bcf3c4015375348200188b00b20a02513886331cf7b26607fe6383b01ad9250fe43f9169b5aeea0058104202480efd399d958c499481b02af9cc21a2caa1bbc1390c3f9acc226ca43941048004202d89c2c4e62b9a3646ff06c96e5339a3a2cbea16f037e7acbe634966153cf04da1148004202f8ffe4329c6a2cd6e0df09788e381633e8dc602a1bc0dfb189f13ced0924002101fc6b5af38c73b5877f27601e16719e68a077f02358808bd7d98340021012c07fa62bb3b18831c1b31310e13456277926e0003ec44519dd0924002101fc7806b01c8b5a46787602f2f86f6ab0589af0bb03ba331d17b339844002101280957caea71a8b55f877025ec06666427f8eefc61bb8f89ca30924002101b8d2cad909f8807dbd4f07b8ef0e2822484876e14fc4b1f98abe44240021016c295d781f9b4914277026a092ab13328edb8e67a8c76619a791452001080960db66026ab8915ccf4ec04dd4d9a59980d301c53c422d366b39875c02094048005b935caea31a8b959ce4f9d7b494e78861f1017b126c438ab8c759fedf7219790412809000b636ad9800099c09e8ce7c2c628cdf86d301cdf92d1bb0d9c0700a0924002101f8645fdec722ce245a7b6f0cac70ce04e410e09f028639cbbf9a31342390008404e09708fd5981450d377836ef9a309a6a2c96d38f08fee57f2915d85431969604128090007e5a27a0d6d90908bc52ca646c6678cf04e470362bb189f2086d0924002101fcb494f00c312c3ef4ee04ecc7022ce29e7b02b23819f73d7fcf524a20010809e0a7a72bb3b09948b16f27c03913308c82adfe2ff5e12b6c624ca12381042024806d4b7fcab1a8e17a723d3b01b7508bc5371c47b05539928f71f10e9d09240021016c6bf29ca7035630c87326a02d2f12c76216bb136c3107320f1733e946200108092011296682734fc03ede7b023ec6a29e4769bda502e15d5ccce5500209404800894a373ec46692e7184f84d3598b45255791e3bcc7e05562d87c4e6fb2240021012432273a2ffe1c4181e7f7fbd1ced78ae3098cb4c77de66fd1e6790209404800894c1e23a8c1621927e23f1310c762ba3113d08e278862b39433c9219000840490e8b4c13d13b0b7f74cc027ce4e40ab1fe9458ca3169bd59c4b1e810420248086c83ecebb039ec17f266035169bfe6363600bee7096ff3aae2297400210124043e524d6384af65acfbfbf4db9991a2cbee158827fa490115462b39151342590008404d070c9e346e79e80138978be564cc6a6ec1f7b02f2b778e6ef569a124800420268d8b46502312c66d3c57b4fc002e79e80d604e47231ee7bfeeea3884002101240c3a72b73b188f1b4e79e806c7e4139169bb88202ce620536311ea72d8104202480e46400e5ce5b04f3137a8be06d2cc126c62476249000840490ac3461049bb058eedd0968cbcbd8c47131950e041280900092991226124fe04c400fe603febc45170209404800c94e67e66033c1fbf67dfb16419b32f6279000840490fc64318855586ce45af213b227c0e6630e2390008404d038c9e5066ab0286780f707c657d87a3ea30f11094048008d9762f7e900eff7f39ecc67ebf87af3e123094048008d997d988745942768e3391370166bd832ab1842b604202480c6cf40563aef0ec8f59c09b8853adcace522720824002101347e0ab8914d58aca23f41026702603d57504020010809203552c2f3d8ccf4dece7b30f3b199c10e041280900052279df9d0b527c0732620c219acc56223bf265702101240ea248b5358814595f79e8002c610c56209c74a00420248a5e433921a2c567a7702daf132712cde650f09404800a994d63c0b09bc3be000e66311e7115a4800420248a57477ee09789262ef4e4005169b184ab604202480d4ea04acc2a28661e47a77026ab1f85aa3c0420248ade433c2d909e847e0951d78099b69ec2e0108092095d286e78963514617ef4ec02758c4799866128090005229dd9883458ca768edd9093813f74c409e04202480d4498441ce8d81c3c8f1ee04d461b198e324002101a452f219e5ba45d0fbf2ce525e72be567494008404904a29e639e258cca4ab7727e0632c623c4c4b09404800a994eeccc122ce5314797702d661b181a1e448004202489799802aff9900e7c6c0a51c2b010809209592cb4847c92e6780672760272613c3621abb4900420248a5b471760266e17f77c06758d4f3475a4800420248a5ecefdc13f024adbc3b011558547225b912809000522927b3dad509f01ce369ca6dd460b1986325002101a452f218491d16cbe84fc4734fc0146ca6d351021012402aa52d938861318b2ede9d804fb188f1478a24002101a452f663aeab13e059b2d9fc926fb158cfafc895008404903a89309035585433dcb3649b701b512c9672b40420248054ca5e2cc066292792e5793ae015e258bc472709404800a992529ea21e17efb32781570ee40b2ceab89f2209404800a99012fe481470f3b4e7819e0867f12d16950c255b0210124063a788df53cb96d9c830cf0bbf0ab9951a2c96f273094048008d9b424653cdd6b19cbedeaf1653b1f92b9d24002101345e9a701d1bd87a3e60cf04cf04b490008404d038c9e5722af0a19ec768e5391370366bb0d8c8e5e448004202487e72388755f852c5d59e25bb1db73937061e2d01080920f9e57f264b317177023c4f076ccf2bd8bccbee12809000929bbe7c854d9c75c4b098e15db207f31916511ea04802101240b212e148166013e73506310f8b38e3bd3b0143588b452597932d01080920393998d9b8984e77024ea5dc51b2d790eff7bdc17977c0527a4b0042024846ba320d171fd18bcdcdbbd1cebb03fa1078a51d7fc1e62d7693008404d0d0d9933770f1c93fcde795f01cf1849e0e58e0de1828010809a021b30b2f11c366f1bfdd09b41ff39d3301c59e8bc8cf622d169bf81559128090001a2adb33817a6c56720659ff56b283598d4525577bef09b88328168bf83911094048000d91363c4c149b72cef991119f7c46528dc52a4ef05e3f36159bbfb18704202480c4a705775385cd7a2ea7c0f8ddf02236d3bd3b01bd709f0e682601080920b129e426366153c90d342130b2afb313309ed6dea703bec562239791230108092091e53f9cef9ce57fb3bb03efbc45b01aff5b046f278ac5628e9100840490a8e471096bb0a9e31ed7dff0ad9a09388ec02b3bf1676cdea1830420248044248721acc6a696c72821d8628a79119b19deb7081eca2758c478806612809000b635d99ccc126cea99c4ce09b93be009ef5b047fc97a2c3672293912809000b62dc7b11017afd2d1432667508e45155779ef09b8837a2cbee26809404800db92c3f90c9b38efb09767376114b558acf09e09d89929c45d1b0325002101fcd41cc0fbb898410ffc87895ec0a6ccbb1370089f6311e37e9a4a004202f829e9cabbc4b1f9984308f04f0f3e4ae0c6c02c86b01e8b0d5c4a8e04202400dfecc1ebb8f8fc279fbf8f30d8798be0d5f877026ab1f83bbd8948004202f0497b9ea71e9b450cdc860d3c05dcec5cedd1c77b26c07d77c0ae12809000b63e3bf034516c9633781b1770b56532712ca67977020ee2332c623c4833094048005b97d6dc4b149bd55c9080dbf97b3837063ee6b9da23c2d9acc3623d97912701080960cb69c1ad5461b38eabd98e609b93c5e9acc162135792edb927e04eeab158c45112809000b694424639cbbf921134214848f2f92db5582ce604229e9d80578863f11eed25002101b84bf24a3660b389db699ed0fd4293b199ce1edebb8abfc022ca385a48004202b092c385acc126ca7db44af8a8d14758c4184ff3849e0eb88c6c094048003f966c7ec92a6cea799c9206b860e43487742ab9d2b37957c8efa871dd2228010809e03f13e124966013e705766ea0d78e9b8962b1843edea703fe8ccddbb497008404f0af89703c5f6013674a035eba51ca8bce5b04f7f07eadf8c2793aa0b9042024807fce11ccc781c799bfc4cf04c4788c22cf0f8c675381c5775c4eae04202480ffcbfeccc4c5fb1cd4e0bf40063b4a761357789e0e68c658a2587ccd111280900036671fdec6c55c7e9684c3344db8991a2c967acf04ecc8abd8bc4b0709404800019df80b2e16721c415252ca0bc413381370280b9d330145128008bb0076e459e2d82ce614b292f82ab22081a703b2398f75587cc74564490022cc02d89ef1c4b059c990a416897b4f4025bf21df6f26c0b927600947480022bc0268c9386ab1a9e012a35bde589d80c51ce73d13f01a366fd2410210e1144033e7c41c7cc7d5e437ca268217896331d37b1ae110bec4a28e7b69260188f009a09091b80ffddc4861a37d949cef9c0968e93913700e15586ce412b22500112e01e4722515d8d47157239e9b8b703adf62f11d5778be9834e76eeab0f88ac32400112601e471016bb0a9651cc5048d98026ea1168be5dea7034a790d9bb7e8200188b0082097212cc326ca6394123472daf112712c667877020ee50b2cea194773094084410011faf23536715e64178214480f3e7348ea218a3cb5773edf62b1810bc9920044a60b20c2cff91c9b18afb127418ae40cd63af704e4fa6f0c749d0e900044a60be050e6e2e23df625489934650cd5582ca5b7f7d4e3ebee9900094064b200f665162ee67040cadd4ef03236d3bc2ffe3c8ccfb188722fcd240091a902d89bb771f13187938a07953fc122ce239e330111fe8b7558547231d91280c8440174e01562d82ce204b252724fe110d660b181a19e9d8042c6528fc5df39520210992780763c4f0c9b659c9c02e56fcf04d461b18cde093c1d10e70d3a4a0022b304d096478962b38221e410a46cdaf227d72d82fe7b029cb7088ea3a90420324700adb807f7455f97524090d239904fb1a8e3415a26704fc0062e22220188cc1040336ec17de66f58ca977f4084339db708fedab379b71d7711c56221474900221304d094e16cc06623a3694e9006d98e310e917dc331045ed989bfb8ef0e900044ba0b208fa1acc3a696b11411a44976600a367f657702af1c8efb7440a10420d2590039fc176b9de5ff10ad09d228fbf33116311ef1be3be03cd63b3706e64800225d0590c5a97c834d3dcfb8cffca5e84cc06a672720cbf374c058a2ae99000940a4a70022f4671136715e665782b44b13c65087c562fad1d62b07330b9b77d8550210e92880de2cc426ceeb742248cb6ccf2bd87cc334a67b641a4bb1a9e70f34950044ba09e0603ec4c57bec4790b6399805248bef389f880420d24900dd994e1c9b391c4890c6c9e617ac21592ce4080940a48f00f6e64d5c2ce02882344f3eb75047b278935d2400911e02e8c86462d87c497fb209d23eed984ab2a8e71e0a250091fa0268c74462d82c651059041991835840b258c745e44a0022b50550cc8344b129e73c72083224599c4505c96221874b0022950550c45db8eff9bb827c820c4a136e274ab2788b9d240091aa0270afcf848d5c4b3e4186a59457481651fe40730940a4a200f2b9868dd8543186a604199843f8946451c105644b0022d504d0845fb31e9b3a7e4f4b828c4c1643a820592ce148221280482501443880c9949999ce584a083236058ca02c4999c1180a2500915a0228a193231d694e90d1694aa7a4a53d791280d87601288a042001281280042001281280900014094048008a042024004502101280220108094091008404a0480042025024002101281280900014094048008a0420d241006fe8c15736a7dbbafb7ba92642456cfbfe53b3f4e82b3fa4e7dafb7aaa2642052d4f9a98af475ff92147acb8772fd544a8a0c9e90f34d3a3affc90de4beeefa89a0815645d3ca26d5c8fbef27dfa7c3a7117d544c8b8e9dc0ed57af495ef33a06c4ea92a22643c3ca853851e7d25209bc193a3ad541121e39d5e5d1745f4f82bec507fd9f5e4aa22424679d1a029057afc153a578c1ba07a0821236f2f8ce9f10f7bb2e8b9a0acbbaa21843c7a7287752a80b0a729e78c5f5fa86a0821ef969c32530510f6b4ad7ce87cd5422821ef37a38ba32a813027429f797fd50c40f03feddceb8bcd791c07f09d99632edbcc98c59cedecaab50fb6adb535dadd988d42c20329b7722884642409453214726910b996945b94c625722d11e2913c714b269472c92d14cdb87c94078a904b6a9cdfebf5fe17de9f6fe7f7fd9eef37a1b65577beea2420c9a9783e6dd1c3944948a8bb25e397b6b21198d8e445f7cbf51dcc4182edeadaa9c1adc0a4a6b269425dd8004cb2fb85b3ea5adb07486452d1f3cce12a33907087db0d3855681c1298768f96d444be0948b8482d1b5675db38246ffbaf66ebd99ff49f1fee97cc9edbd6cdc044a545f43ebdf33fdde7b50be9b19bdb34198ba4243fba5cd9d457ef79e3e05fd9fd150e041391bcf8f7f6aad1eefff1961d1dfb1d29b704e47cf2a3eae682894f8b359e77ecfa27bbb7d28740aedffdbb3e6fec8d526de73d0eb4afd9d2f6893f07e76a8aa3dbe53543a348d3f980b36de6d456ddf260782e26d338e8d096ee4efef9a8285a91ed7f34d3e477402ea538aa6f4dad3beef16f3ec5c9df67ccebdcd0f28545203786ffb7c7a376afeb13befcf954d1624fc7198bab2ffdfacc22f03da72cdadf1bb46ff598735efde573456affff93a60f38d6e14ec9cb54b833f83da520529169ecd5307cfdaa811733bacc178a820b99953d6a178dd9d3e9d22f0fd24fd2cf2ba322caa2549a5d5a46eb48bf4c37fefcf88f9b034f4cd930bf66db9f51aec37cb528b85674f2effac1cbc6cfac9db460d4f2211bb3f5d9edd2acb275c4da718ba7cd5e3879c3c8833dceb78a54e4692edf40e4c78f5116e5d2ac521a85ba0900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000039ec15960b73411b9fe6d50000000049454e44ae426082, 'image/png');

-- --------------------------------------------------------

--
-- Table structure for table `universities`
--

CREATE TABLE `universities` (
  `university_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `contactEmail` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `universities`
--

INSERT INTO `universities` (`university_id`, `name`, `address`, `contactEmail`, `created_at`, `description`) VALUES
('UNI-123456', 'University-UNI-123456', '123, Jalan ABC, Taman Hello 31400, Ipoh', NULL, '2025-09-15 18:27:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','employer','system admin','super admin') NOT NULL,
  `is_complete` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role`, `is_complete`) VALUES
('70a33156-4c73-45a0-bcde-773cb98d774f', 'yeoutorng.lau@qiu.edu.my', '$2b$10$7vriLgKRAjmxIoK3NVlmwukOXMRqP.4Nz/56ymfuQYWAcK5TpJ/eK', 'student', 1),
('USER-caeef602-cf73-46ae-bd3b-9812022', 'quest@qiu.edu.my', '$2b$10$H4sSyYnC4TUkMn.uyhK1e.JMXyArmjMi0lPeX7x62Zf.LUVXzn3ce', 'system admin', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `internship_id` (`internship_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employers`
--
ALTER TABLE `employers`
  ADD PRIMARY KEY (`company_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `internships`
--
ALTER TABLE `internships`
  ADD PRIMARY KEY (`internship_id`),
  ADD KEY `company_id` (`company_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `subscription_id` (`subscription_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `resume`
--
ALTER TABLE `resume`
  ADD PRIMARY KEY (`resume_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `matricNo` (`matricNo`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `university_id` (`university_id`),
  ADD KEY `resume_id` (`resume_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`subscription_id`),
  ADD UNIQUE KEY `payment_id` (`payment_id`),
  ADD KEY `university_id` (`university_id`);

--
-- Indexes for table `system_admins`
--
ALTER TABLE `system_admins`
  ADD PRIMARY KEY (`systemAdmin_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `university_id` (`university_id`);

--
-- Indexes for table `universities`
--
ALTER TABLE `universities`
  ADD PRIMARY KEY (`university_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`internship_id`) REFERENCES `internships` (`internship_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `employers`
--
ALTER TABLE `employers`
  ADD CONSTRAINT `employers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `internships`
--
ALTER TABLE `internships`
  ADD CONSTRAINT `internships_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `employers` (`company_id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`subscription_id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `employers` (`company_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`university_id`) REFERENCES `universities` (`university_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`resume_id`) REFERENCES `resume` (`resume_id`) ON DELETE SET NULL;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `fk_subscription_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`university_id`) REFERENCES `universities` (`university_id`) ON DELETE CASCADE;

--
-- Constraints for table `system_admins`
--
ALTER TABLE `system_admins`
  ADD CONSTRAINT `system_admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `system_admins_ibfk_2` FOREIGN KEY (`university_id`) REFERENCES `universities` (`university_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
