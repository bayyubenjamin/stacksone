;; Config updated 2026-06-12T12:40:59Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u22)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
