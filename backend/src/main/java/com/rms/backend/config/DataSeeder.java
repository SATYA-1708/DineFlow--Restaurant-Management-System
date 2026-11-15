package com.rms.backend.config;

import com.rms.backend.entity.*;
import com.rms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed Users
        User admin = null;
        if (!userRepository.existsByEmail("admin@rms.com")) {
            admin = userRepository.save(User.builder()
                .fullName("System Admin")
                .email("admin@rms.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("9876543210")
                .role(User.Role.ADMIN)
                .isActive(true)
                .build());
            log.info("✅ Admin created  →  admin@rms.com / admin123");
        }

        User staff = null;
        if (!userRepository.existsByEmail("staff@rms.com")) {
            staff = userRepository.save(User.builder()
                .fullName("Demo Staff")
                .email("staff@rms.com")
                .password(passwordEncoder.encode("staff123"))
                .phone("9876543211")
                .role(User.Role.STAFF)
                .isActive(true)
                .build());
            log.info("✅ Staff created  →  staff@rms.com / staff123");
        }

        User customer = userRepository.findByEmail("customer@rms.com").orElse(null);
        if (customer == null) {
            customer = userRepository.save(User.builder()
                .fullName("Satya Sharma")
                .email("customer@rms.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("9876543212")
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build());
            log.info("✅ Customer created  →  customer@rms.com / customer123");
        }

        // 2. Seed Categories & Items
        if (categoryRepository.count() == 0) {
            MenuCategory starters = categoryRepository.save(MenuCategory.builder()
                .name("Starters & Appetizers")
                .description("Crispy, smoky, and delightful finger foods to kickstart your meal")
                .sortOrder(1).isActive(true).build());

            MenuCategory tandoori = categoryRepository.save(MenuCategory.builder()
                .name("Tandoori Specialties")
                .description("Clay-oven roasted kebabs and tikkas marinated with rich aromatic spices")
                .sortOrder(2).isActive(true).build());

            MenuCategory mainCurries = categoryRepository.save(MenuCategory.builder()
                .name("Main Course (Curries)")
                .description("Rich and velvety north and south Indian gravies prepared to perfection")
                .sortOrder(3).isActive(true).build());

            MenuCategory biryani = categoryRepository.save(MenuCategory.builder()
                .name("Biryani & Rice Bowls")
                .description("Dum-cooked basmati rice layered with fragrant saffron, herbs, and spices")
                .sortOrder(4).isActive(true).build());

            MenuCategory breads = categoryRepository.save(MenuCategory.builder()
                .name("Artisanal Breads")
                .description("Freshly baked tandoori naans, rotis, and stuffed kulchas")
                .sortOrder(5).isActive(true).build());

            MenuCategory desserts = categoryRepository.save(MenuCategory.builder()
                .name("Desserts & Beverages")
                .description("Traditional sweet indulgences, refreshing lassis, and hot brews")
                .sortOrder(6).isActive(true).build());

            // Items
            MenuItem paneerTikka = menuItemRepository.save(MenuItem.builder()
                .category(starters).name("Paneer Tikka Angara")
                .description("Cottage cheese cubes marinated in spiced hung curd with peppers and grilled over charcoal")
                .price(new BigDecimal("280.00")).estimatedMinutes(15).isAvailable(true).build());

            menuItemRepository.save(MenuItem.builder()
                .category(starters).name("Crispy Chilli Corn")
                .description("Golden American corn tossed with chopped garlic, green chillies, and fresh spring onions")
                .price(new BigDecimal("220.00")).estimatedMinutes(12).isAvailable(true).build());

            MenuItem malaiTikka = menuItemRepository.save(MenuItem.builder()
                .category(tandoori).name("Murgh Malai Tikka")
                .description("Tender chicken morsels steeped in cheese, cream, cardamom, and roasted in clay oven")
                .price(new BigDecimal("360.00")).estimatedMinutes(18).isAvailable(true).build());

            MenuItem butterChicken = menuItemRepository.save(MenuItem.builder()
                .category(mainCurries).name("Old Delhi Butter Chicken")
                .description("Classic pulled tandoori chicken simmered in rich creamy tomato and cashew nut gravy")
                .price(new BigDecimal("420.00")).estimatedMinutes(20).isAvailable(true).build());

            MenuItem dalMakhani = menuItemRepository.save(MenuItem.builder()
                .category(mainCurries).name("Dal Makhani Bukhara Style")
                .description("Slow-cooked black lentils simmered overnight with tomatoes, white butter, and cream")
                .price(new BigDecimal("290.00")).estimatedMinutes(15).isAvailable(true).build());

            MenuItem biryaniItem = menuItemRepository.save(MenuItem.builder()
                .category(biryani).name("Hyderabadi Dum Biryani")
                .description("Long grain basmati rice and aromatic spices slow-cooked under sealed earthen handi")
                .price(new BigDecimal("380.00")).estimatedMinutes(22).isAvailable(true).build());

            MenuItem naan = menuItemRepository.save(MenuItem.builder()
                .category(breads).name("Garlic Butter Naan")
                .description("Soft leavened tandoor bread brushed with melted garlic butter and fresh coriander")
                .price(new BigDecimal("75.00")).estimatedMinutes(8).isAvailable(true).build());

            MenuItem gulabJamun = menuItemRepository.save(MenuItem.builder()
                .category(desserts).name("Gulab Jamun with Kesari Rabri")
                .description("Warm khoya dumplings soaked in rose saffron syrup, served on chilled rabri")
                .price(new BigDecimal("160.00")).estimatedMinutes(10).isAvailable(true).build());

            log.info("✅ Menu categories and dish catalog seeded");
        }

        // 3. Seed Tables
        if (tableRepository.count() == 0) {
            RestaurantTable t1 = tableRepository.save(RestaurantTable.builder().tableNumber("T-01").capacity(2).section("Window Bay").status(RestaurantTable.TableStatus.AVAILABLE).build());
            RestaurantTable t2 = tableRepository.save(RestaurantTable.builder().tableNumber("T-02").capacity(4).section("Main Dining Hall").status(RestaurantTable.TableStatus.AVAILABLE).build());
            RestaurantTable t3 = tableRepository.save(RestaurantTable.builder().tableNumber("T-03").capacity(4).section("Main Dining Hall").status(RestaurantTable.TableStatus.OCCUPIED).build());
            RestaurantTable t4 = tableRepository.save(RestaurantTable.builder().tableNumber("T-04").capacity(6).section("Family Lounge").status(RestaurantTable.TableStatus.RESERVED).build());
            tableRepository.save(RestaurantTable.builder().tableNumber("VIP-1").capacity(8).section("Private Dining Suite").status(RestaurantTable.TableStatus.AVAILABLE).build());
            tableRepository.save(RestaurantTable.builder().tableNumber("Terrace-1").capacity(4).section("Rooftop Patio").status(RestaurantTable.TableStatus.AVAILABLE).build());
            log.info("✅ Dining floor tables seeded");

            // 4. Seed Reservations
            if (customer != null) {
                reservationRepository.save(Reservation.builder()
                    .customer(customer).table(t4).partySize(4)
                    .reservedAt(LocalDateTime.now().plusHours(2))
                    .status(Reservation.ReservationStatus.CONFIRMED)
                    .notes("Window seating requested for anniversary dinner")
                    .build());

                reservationRepository.save(Reservation.builder()
                    .customer(customer).table(t1).partySize(2)
                    .reservedAt(LocalDateTime.now().plusHours(5))
                    .status(Reservation.ReservationStatus.PENDING)
                    .notes("Birthday celebration table decor")
                    .build());
            }
        }
    }
}
