package com.parking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dto.GeocodeResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class GeocodingService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final Map<String, GeocodeResponse> localCoordinates;

    public GeocodingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT, "parking-marketplace/1.0")
                .build();
        this.localCoordinates = createLocalCoordinates();
    }

    public GeocodeResponse geocode(String address) {
        if (address == null || address.trim().isEmpty()) {
            throw new IllegalArgumentException("Address is required");
        }

        GeocodeResponse local = lookupLocal(address);
        if (local != null) {
            return local;
        }

        try {
            String body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("format", "jsonv2")
                            .queryParam("limit", "1")
                            .queryParam("q", address)
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(body);
            if (!root.isArray() || root.isEmpty()) {
                throw new IllegalArgumentException("Location not found");
            }

            JsonNode first = root.get(0);
            return new GeocodeResponse(
                    first.get("lat").asDouble(),
                    first.get("lon").asDouble(),
                    first.get("display_name").asText()
            );
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Unable to resolve address right now");
        }
    }

    private GeocodeResponse lookupLocal(String address) {
        String normalized = address.trim().toLowerCase(Locale.ROOT);
        for (Map.Entry<String, GeocodeResponse> entry : localCoordinates.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private Map<String, GeocodeResponse> createLocalCoordinates() {
        Map<String, GeocodeResponse> map = new LinkedHashMap<>();
        map.put("guindy", new GeocodeResponse(13.010500, 80.220900, "Guindy, Chennai"));
        map.put("chennai", new GeocodeResponse(13.082700, 80.270700, "Chennai"));
        map.put("bangalore", new GeocodeResponse(12.971600, 77.594600, "Bengaluru"));
        map.put("bengaluru", new GeocodeResponse(12.971600, 77.594600, "Bengaluru"));
        map.put("hyderabad", new GeocodeResponse(17.385000, 78.486700, "Hyderabad"));
        map.put("mumbai", new GeocodeResponse(19.076000, 72.877700, "Mumbai"));
        map.put("koramangala", new GeocodeResponse(12.935200, 77.624500, "Koramangala, Bengaluru"));
        map.put("whitefield", new GeocodeResponse(12.969800, 77.749900, "Whitefield, Bengaluru"));
        map.put("hitech city", new GeocodeResponse(17.443500, 78.377200, "Hitech City, Hyderabad"));
        map.put("banjara hills", new GeocodeResponse(17.412600, 78.448200, "Banjara Hills, Hyderabad"));
        map.put("bandra", new GeocodeResponse(19.059600, 72.829500, "Bandra West, Mumbai"));
        map.put("andheri", new GeocodeResponse(19.113600, 72.869700, "Andheri East, Mumbai"));
        return map;
    }
}
