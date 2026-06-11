;; Config updated 2026-06-11T11:45:46Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u29)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
