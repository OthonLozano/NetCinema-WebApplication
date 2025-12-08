package com.netcinema.SB.MongoDB.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.security.Key;

@Component
@Slf4j
public class JwtTokenProvider {
    @Value("${netcinema.jwt.secret}")
    private String jwtSecret;

    @Value("${netcinema.jwt.expiration}")
    private long jwtExpiration;

    public String generarToken(Authentication authentication) {
        String email = authentication.getName();
        Date now = new Date();
        Date expiration = new Date(now.getTime() + jwtExpiration);

        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String obtenerEmailDeToken(String token){
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validarToken(String authToken) {
        try{
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        }catch(JwtException ex){
            log.error("Token JWT inválido: {}", ex.getMessage());
        }
        return false;
    }
}
