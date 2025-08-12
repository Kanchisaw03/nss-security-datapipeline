from __future__ import annotations

import os
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def main() -> None:
    keys_dir = Path("backend/app/auth/keys")
    keys_dir.mkdir(parents=True, exist_ok=True)
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_key = private_key.public_key()
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    (keys_dir / "dev_rsa_private.pem").write_bytes(private_bytes)
    (keys_dir / "dev_rsa_public.pem").write_bytes(public_bytes)
    print("Generated dev RSA keys under backend/app/auth/keys/")


if __name__ == "__main__":
    main()


