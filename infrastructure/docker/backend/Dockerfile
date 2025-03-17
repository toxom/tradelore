FROM rust:1.75
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release
EXPOSE 8080
CMD ["./target/release/trading-platform"]