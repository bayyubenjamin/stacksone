;; Config updated 2026-05-27T20:51:00Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u40)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
