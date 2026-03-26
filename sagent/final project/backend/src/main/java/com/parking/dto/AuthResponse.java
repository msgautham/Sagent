package com.parking.dto;

public class AuthResponse {

    private String token;
    private String role;
    private Long userId;
    private String name;
    private String email;

    public AuthResponse(String token, String role, Long userId, String name, String email) {
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.name = name;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
