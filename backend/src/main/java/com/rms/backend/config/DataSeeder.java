package com.rms.backend.config;

import com.rms.backend.entity.*;
import com.rms.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

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
    @Transactional
    public void run(String... args) {
        log.info("🚀 DineFlow DataSeeder started...");

        // 1. Seed Users
        User admin = userRepository.findByEmail("admin@rms.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("System Admin")
                .email("admin@rms.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("9876543210")
                .role(User.Role.ADMIN)
                .isActive(true)
                .build())
        );

        User staff = userRepository.findByEmail("staff@rms.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("Rajesh Verma (Captain)")
                .email("staff@rms.com")
                .password(passwordEncoder.encode("staff123"))
                .phone("9876543211")
                .role(User.Role.STAFF)
                .isActive(true)
                .build())
        );

        User chef = userRepository.findByEmail("chef@rms.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("Chef Sanjeev Anand")
                .email("chef@rms.com")
                .password(passwordEncoder.encode("chef123"))
                .phone("9876543219")
                .role(User.Role.STAFF)
                .isActive(true)
                .build())
        );

        User customer1 = userRepository.findByEmail("customer@rms.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("Rama Satya")
                .email("customer@rms.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("9876543212")
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build())
        );

        User customer2 = userRepository.findByEmail("priya@rms.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("Priya Nair")
                .email("priya@rms.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("9876543213")
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build())
        );

        User customer3 = userRepository.findByEmail("vikram@rms.com").orElseGet(() ->
            userRepository.save(User.builder()
                .fullName("Vikram Malhotra")
                .email("vikram@rms.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("9876543214")
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build())
        );

        // 2. Seed Categories
        MenuCategory starters = getOrCreateCategory("Starters & Appetizers", "Crispy, smoky, and delightful finger foods to kickstart your meal", 1);
        MenuCategory tandoori = getOrCreateCategory("Tandoori Specialties", "Clay-oven roasted kebabs and tikkas marinated with rich aromatic spices", 2);
        MenuCategory mainCurries = getOrCreateCategory("Main Course (Curries)", "Rich and velvety north and south Indian gravies prepared to perfection", 3);
        MenuCategory biryani = getOrCreateCategory("Biryani & Rice Bowls", "Dum-cooked basmati rice layered with fragrant saffron, herbs, and spices", 4);
        MenuCategory breads = getOrCreateCategory("Artisanal Breads", "Freshly baked tandoori naans, rotis, and stuffed kulchas", 5);
        MenuCategory desserts = getOrCreateCategory("Desserts & Beverages", "Traditional sweet indulgences, refreshing lassis, and hot brews", 6);

        // 3. Seed Menu Items with High Quality Images
        MenuItem paneerTikka = upsertDish(starters, "Paneer Tikka Angara",
            "Cottage cheese cubes marinated in spiced hung curd with peppers and grilled over charcoal",
            new BigDecimal("280.00"), 15,
            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=700&auto=format&fit=crop&q=80");

        MenuItem crispyCorn = upsertDish(starters, "Crispy Chilli Corn",
            "Golden American corn tossed with chopped garlic, green chillies, and fresh spring onions",
            new BigDecimal("220.00"), 12,
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700&auto=format&fit=crop&q=80");

        MenuItem dahiKebab = upsertDish(starters, "Dahi Ke Kebab",
            "Crispy golden hung curd patties spiced with green cardamom and fresh mint",
            new BigDecimal("240.00"), 14,
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80");

        MenuItem malaiTikka = upsertDish(tandoori, "Murgh Malai Tikka",
            "Tender chicken morsels steeped in cheese, cream, cardamom, and roasted in clay oven",
            new BigDecimal("360.00"), 18,
            "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=700&auto=format&fit=crop&q=80");

        MenuItem soyaChaap = upsertDish(tandoori, "Tandoori Soya Chaap",
            "Protein-rich soya cutlets chargrilled with robust Punjabi spices and mint chutney",
            new BigDecimal("290.00"), 16,
            "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80");

        MenuItem butterChicken = upsertDish(mainCurries, "Old Delhi Butter Chicken",
            "Classic pulled tandoori chicken simmered in rich creamy tomato and cashew nut gravy",
            new BigDecimal("420.00"), 20,
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700&auto=format&fit=crop&q=80");

        MenuItem dalMakhani = upsertDish(mainCurries, "Dal Makhani Bukhara Style",
            "Slow-cooked black lentils simmered overnight with tomatoes, white butter, and cream",
            new BigDecimal("290.00"), 15,
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80");

        MenuItem paneerButter = upsertDish(mainCurries, "Paneer Butter Masala",
            "Fresh cottage cheese cubes bathed in a velvety tomato-cashew makhani gravy",
            new BigDecimal("320.00"), 16,
            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700&auto=format&fit=crop&q=80");

        MenuItem roganJosh = upsertDish(mainCurries, "Kashmiri Mutton Rogan Josh",
            "Slow-braised spring lamb cooked with Kashmiri red chillies, ratan jot, and whole spices",
            new BigDecimal("480.00"), 25,
            "https://images.unsplash.com/photo-1545247181-516773cae7be?w=700&auto=format&fit=crop&q=80");

        MenuItem dumBiryani = upsertDish(biryani, "Hyderabadi Dum Biryani",
            "Long grain basmati rice and succulent chicken slow-cooked under sealed earthen handi",
            new BigDecimal("380.00"), 22,
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80");

        MenuItem vegBiryani = upsertDish(biryani, "Lucknowi Subz Biryani",
            "Garden fresh seasonal vegetables and fragrant basmati layered with saffron milk",
            new BigDecimal("310.00"), 18,
            "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700&auto=format&fit=crop&q=80");

        MenuItem garlicNaan = upsertDish(breads, "Garlic Butter Naan",
            "Soft leavened tandoor bread brushed with melted garlic butter and fresh coriander",
            new BigDecimal("75.00"), 8,
            "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=700&auto=format&fit=crop&q=80");

        MenuItem amritsariKulcha = upsertDish(breads, "Amritsari Aloo Pyaaz Kulcha",
            "Crispy layered bread stuffed with spiced potatoes, onions, and pomegranate seeds",
            new BigDecimal("95.00"), 10,
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&auto=format&fit=crop&q=80");

        MenuItem gulabJamun = upsertDish(desserts, "Gulab Jamun with Kesari Rabri",
            "Warm khoya dumplings soaked in rose saffron syrup, served on chilled rabri",
            new BigDecimal("160.00"), 10,
            "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80");

        MenuItem rasmalai = upsertDish(desserts, "Royal Kesar Rasmalai",
            "Pillowy cottage cheese patties soaked in saffron clotted milk and roasted pistachios",
            new BigDecimal("180.00"), 8,
            "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=700&auto=format&fit=crop&q=80");

        MenuItem mangoLassi = upsertDish(desserts, "Alphonso Mango Lassi Royale",
            "Thick churned sweet yogurt blended with Ratnagiri Alphonso mango pulp and cardamom",
            new BigDecimal("140.00"), 5,
            "https://images.unsplash.com/photo-1546173159-315724a31696?w=700&auto=format&fit=crop&q=80");

        // 4. Seed Tables
        RestaurantTable t1 = upsertTable("T-01", 2, "Window Bay", RestaurantTable.TableStatus.OCCUPIED);
        RestaurantTable t2 = upsertTable("T-02", 2, "Window Bay", RestaurantTable.TableStatus.AVAILABLE);
        RestaurantTable t3 = upsertTable("T-03", 4, "Main Dining Hall", RestaurantTable.TableStatus.OCCUPIED);
        RestaurantTable t4 = upsertTable("T-04", 4, "Main Dining Hall", RestaurantTable.TableStatus.AVAILABLE);
        RestaurantTable t5 = upsertTable("T-05", 6, "Main Dining Hall", RestaurantTable.TableStatus.AVAILABLE);
        RestaurantTable t6 = upsertTable("T-06", 6, "Family Lounge", RestaurantTable.TableStatus.RESERVED);
        RestaurantTable vip1 = upsertTable("VIP-1", 8, "Private Dining Suite", RestaurantTable.TableStatus.RESERVED);
        RestaurantTable terrace1 = upsertTable("Terrace-1", 4, "Rooftop Patio", RestaurantTable.TableStatus.OCCUPIED);
        RestaurantTable terrace2 = upsertTable("Terrace-2", 4, "Rooftop Patio", RestaurantTable.TableStatus.AVAILABLE);

        // 5. Seed Reservations
        if (reservationRepository.count() <= 2) {
            reservationRepository.save(Reservation.builder()
                .customer(customer1).table(t6).partySize(4)
                .reservedAt(LocalDateTime.now().plusHours(2))
                .status(Reservation.ReservationStatus.CONFIRMED)
                .notes("Window seating requested for anniversary dinner celebration")
                .build());

            reservationRepository.save(Reservation.builder()
                .customer(customer2).table(vip1).partySize(6)
                .reservedAt(LocalDateTime.now().plusHours(4))
                .status(Reservation.ReservationStatus.CONFIRMED)
                .notes("Corporate executive dining with chef's tasting menu")
                .build());

            reservationRepository.save(Reservation.builder()
                .customer(customer3).table(t2).partySize(2)
                .reservedAt(LocalDateTime.now().plusHours(6))
                .status(Reservation.ReservationStatus.PENDING)
                .notes("Quiet corner table for birthday dinner")
                .build());

            reservationRepository.save(Reservation.builder()
                .customer(customer1).table(terrace1).partySize(3)
                .reservedAt(LocalDateTime.now().plusDays(1).withHour(19).withMinute(30))
                .status(Reservation.ReservationStatus.CONFIRMED)
                .notes("Rooftop terrace sunset reservation")
                .build());
        }

        // 6. Seed Realistic Orders & Payments (for live analytics & active orders)
        if (orderRepository.count() == 0) {
            log.info("🍽️ Seeding sample orders, items, and revenue data...");

            // Order 1: Closed bill (Revenue)
            createOrder(customer1, staff, t1, Order.OrderStatus.CLOSED,
                List.of(
                    new OrderItemEntry(butterChicken, 2),
                    new OrderItemEntry(garlicNaan, 4),
                    new OrderItemEntry(dalMakhani, 1),
                    new OrderItemEntry(mangoLassi, 2)
                ),
                "Extra crispy garlic naan requested", false,
                Payment.PaymentMethod.CARD, Payment.PaymentStatus.COMPLETED,
                LocalDateTime.now().minusHours(3));

            // Order 2: Closed bill (Revenue)
            createOrder(customer2, staff, t3, Order.OrderStatus.CLOSED,
                List.of(
                    new OrderItemEntry(dumBiryani, 2),
                    new OrderItemEntry(malaiTikka, 1),
                    new OrderItemEntry(gulabJamun, 2)
                ),
                "Medium spice level preferred", false,
                Payment.PaymentMethod.ONLINE, Payment.PaymentStatus.COMPLETED,
                LocalDateTime.now().minusHours(2));

            // Order 3: Closed bill (Revenue)
            createOrder(customer3, staff, terrace1, Order.OrderStatus.CLOSED,
                List.of(
                    new OrderItemEntry(paneerTikka, 1),
                    new OrderItemEntry(paneerButter, 1),
                    new OrderItemEntry(garlicNaan, 3),
                    new OrderItemEntry(rasmalai, 2)
                ),
                "Anniversary table treat", false,
                Payment.PaymentMethod.CASH, Payment.PaymentStatus.COMPLETED,
                LocalDateTime.now().minusHours(1).minusMinutes(30));

            // Order 4: Active - SERVED
            createOrder(customer1, staff, t1, Order.OrderStatus.SERVED,
                List.of(
                    new OrderItemEntry(roganJosh, 1),
                    new OrderItemEntry(garlicNaan, 2),
                    new OrderItemEntry(crispyCorn, 1)
                ),
                "Serve piping hot", false,
                Payment.PaymentMethod.ONLINE, Payment.PaymentStatus.PENDING,
                LocalDateTime.now().minusMinutes(45));

            // Order 5: Active - IN_PROGRESS (Kitchen cooking)
            createOrder(customer2, staff, t3, Order.OrderStatus.IN_PROGRESS,
                List.of(
                    new OrderItemEntry(dumBiryani, 1),
                    new OrderItemEntry(soyaChaap, 1),
                    new OrderItemEntry(dahiKebab, 1)
                ),
                "Chef special spicy tadka", false,
                Payment.PaymentMethod.CARD, Payment.PaymentStatus.PENDING,
                LocalDateTime.now().minusMinutes(20));

            // Order 6: Active - READY (Ready to serve)
            createOrder(customer3, staff, terrace1, Order.OrderStatus.READY,
                List.of(
                    new OrderItemEntry(paneerTikka, 1),
                    new OrderItemEntry(mangoLassi, 2)
                ),
                "Serve with extra lemon and mint dip", false,
                Payment.PaymentMethod.ONLINE, Payment.PaymentStatus.PENDING,
                LocalDateTime.now().minusMinutes(12));

            // Order 7: Takeaway Parcel - CONFIRMED
            createOrder(customer1, staff, null, Order.OrderStatus.CONFIRMED,
                List.of(
                    new OrderItemEntry(butterChicken, 1),
                    new OrderItemEntry(dumBiryani, 1),
                    new OrderItemEntry(amritsariKulcha, 2)
                ),
                "Packed in eco-friendly tamper-proof containers", true,
                Payment.PaymentMethod.ONLINE, Payment.PaymentStatus.PENDING,
                LocalDateTime.now().minusMinutes(5));
        }

        log.info("✅ DineFlow database successfully populated with rich sample data!");
    }

    private MenuCategory getOrCreateCategory(String name, String desc, int order) {
        return categoryRepository.findAll().stream()
            .filter(c -> c.getName().equalsIgnoreCase(name))
            .findFirst()
            .orElseGet(() -> categoryRepository.save(MenuCategory.builder()
                .name(name).description(desc).sortOrder(order).isActive(true).build()));
    }

    private MenuItem upsertDish(MenuCategory category, String name, String desc, BigDecimal price, int prepMins, String imageUrl) {
        Optional<MenuItem> existing = menuItemRepository.findAll().stream()
            .filter(i -> i.getName().equalsIgnoreCase(name))
            .findFirst();

        if (existing.isPresent()) {
            MenuItem item = existing.get();
            item.setCategory(category);
            item.setDescription(desc);
            item.setPrice(price);
            item.setEstimatedMinutes(prepMins);
            item.setImageUrl(imageUrl);
            item.setIsAvailable(true);
            return menuItemRepository.save(item);
        } else {
            return menuItemRepository.save(MenuItem.builder()
                .category(category)
                .name(name)
                .description(desc)
                .price(price)
                .estimatedMinutes(prepMins)
                .imageUrl(imageUrl)
                .isAvailable(true)
                .build());
        }
    }

    private RestaurantTable upsertTable(String tableNumber, int capacity, String section, RestaurantTable.TableStatus status) {
        return tableRepository.findAll().stream()
            .filter(t -> t.getTableNumber().equalsIgnoreCase(tableNumber))
            .findFirst()
            .orElseGet(() -> tableRepository.save(RestaurantTable.builder()
                .tableNumber(tableNumber)
                .capacity(capacity)
                .section(section)
                .status(status)
                .build()));
    }

    private record OrderItemEntry(MenuItem item, int qty) {}

    private void createOrder(User customer, User staff, RestaurantTable table,
                             Order.OrderStatus status, List<OrderItemEntry> items,
                             String notes, boolean isParcel,
                             Payment.PaymentMethod payMethod, Payment.PaymentStatus payStatus,
                             LocalDateTime orderTime) {

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemEntry entry : items) {
            subtotal = subtotal.add(entry.item().getPrice().multiply(BigDecimal.valueOf(entry.qty())));
        }
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.05")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        Order order = Order.builder()
            .customer(customer)
            .staff(staff)
            .table(table)
            .status(status)
            .taxAmount(tax)
            .totalAmount(total)
            .notes(notes)
            .isParcel(isParcel)
            .createdAt(orderTime)
            .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemEntry entry : items) {
            orderItems.add(OrderItem.builder()
                .order(order)
                .menuItem(entry.item())
                .quantity(entry.qty())
                .unitPrice(entry.item().getPrice())
                .build());
        }
        order.setOrderItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        Payment payment = Payment.builder()
            .order(savedOrder)
            .amount(total)
            .paymentMethod(payMethod)
            .status(payStatus)
            .transactionRef("TXN-" + System.currentTimeMillis() % 1000000)
            .paidAt(payStatus == Payment.PaymentStatus.COMPLETED ? orderTime : null)
            .build();
        paymentRepository.save(payment);
    }
}
