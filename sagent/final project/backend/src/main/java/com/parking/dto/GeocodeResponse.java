package com.parking.dto;

public class GeocodeResponse {

    private double lat;
    private double lng;
    private String label;

    public GeocodeResponse() {
    }

    public GeocodeResponse(double lat, double lng, String label) {
        this.lat = lat;
        this.lng = lng;
        this.label = label;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
