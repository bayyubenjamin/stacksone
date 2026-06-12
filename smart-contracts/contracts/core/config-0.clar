;; Config updated 2026-06-12T15:03:33Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u32)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
