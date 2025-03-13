-- Drop the existing foreign key constraint if it exists
ALTER TABLE detalle_ventas
DROP CONSTRAINT IF EXISTS detalle_ventas_producto_id_fkey;

-- Add new column to store the product type
ALTER TABLE detalle_ventas
ADD COLUMN IF NOT EXISTS es_peso BOOLEAN DEFAULT false;

-- Create a function to validate product references
CREATE OR REPLACE FUNCTION validate_product_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_peso THEN
        -- Check if product exists in productos_peso table
        IF NOT EXISTS (SELECT 1 FROM productos_peso WHERE id = NEW.producto_id) THEN
            RAISE EXCEPTION 'Referenced product does not exist in productos_peso table';
        END IF;
    ELSE
        -- Check if product exists in productos table
        IF NOT EXISTS (SELECT 1 FROM productos WHERE id = NEW.producto_id) THEN
            RAISE EXCEPTION 'Referenced product does not exist in productos table';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product reference validation
DROP TRIGGER IF EXISTS validate_product_reference_trigger ON detalle_ventas;
CREATE TRIGGER validate_product_reference_trigger
    BEFORE INSERT OR UPDATE ON detalle_ventas
    FOR EACH ROW
    EXECUTE FUNCTION validate_product_reference();

-- Add index for performance optimization
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_es_peso ON detalle_ventas(es_peso);

-- Add documentation
COMMENT ON COLUMN detalle_ventas.es_peso IS 'Indica si el producto vendido es por peso (true) o unidad (false)';
COMMENT ON FUNCTION validate_product_reference() IS 'Validates that product_id references exist in the appropriate product table based on es_peso flag';

-- Ensure changes are applied
COMMIT;

-- Refresh schema
NOTIFY pgrst, 'reload schema';