from django.contrib import admin
from .models import CarMake, CarModel

# 1. Define the Inline class for CarModel
# This allows you to add/edit Car Models on the Car Make page
class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1  # Provides one empty slot to add a new model easily

# 2. Define the CarModelAdmin class
class CarModelAdmin(admin.ModelAdmin):
    # Display these fields in the admin list view
    list_display = ('name', 'car_make', 'type', 'year', 'dealer_id')
    # Add filters on the right sidebar
    list_filter = ['type', 'car_make', 'year']
    # Add a search bar
    search_fields = ['name', 'car_make__name']

# 3. Define the CarMakeAdmin class
class CarMakeAdmin(admin.ModelAdmin):
    # Display name and description in the list view
    list_display = ('name', 'description')
    # Include CarModelInline to manage models from the Make page
    inlines = [CarModelInline]

# 4. Register the models with their respective Admin classes
# Note: We replace the basic admin.site.register(CarMake) with these
admin.site.register(CarMake, CarMakeAdmin)
admin.site.register(CarModel, CarModelAdmin)