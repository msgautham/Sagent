package com.parking.service;

import com.parking.dto.AuthRequest;
import com.parking.dto.AuthResponse;
import com.parking.dto.RegisterRequest;
import com.parking.entity.Role;
import com.parking.entity.User;
import com.parking.repository.RoleRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.WalletRepository;
import com.parking.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new IllegalArgumentException("Email already registered");
        });
        Role role = roleRepository.findByName(request.getRole().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("Invalid role"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user = userRepository.save(user);

        com.parking.entity.Wallet wallet = new com.parking.entity.Wallet();
        wallet.setUser(user);
        wallet.setBalance(new BigDecimal("5000.00"));
        walletRepository.save(wallet);

        Map<String, Object> claims = buildClaims(user);
        String token = jwtUtil.generateToken(user.getEmail(), claims);
        return new AuthResponse(token, role.getName(), user.getId(), user.getName(), user.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Map<String, Object> claims = buildClaims(user);
        String token = jwtUtil.generateToken(user.getEmail(), claims);
        return new AuthResponse(token, user.getRole().getName(), user.getId(), user.getName(), user.getEmail());
    }

    private Map<String, Object> buildClaims(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().getName());
        claims.put("userId", user.getId());
        claims.put("name", user.getName());
        return claims;
    }
}
